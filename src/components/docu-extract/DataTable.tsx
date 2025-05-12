"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadCloud, AlertCircle, TableIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataTableProps {
  jsonData: string | null;
  fileName: string | null;
}

interface ParsedData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  isObjectArray: boolean;
  originalData: any;
}

function parseJsonData(jsonString: string): ParsedData | null {
  try {
    const data = JSON.parse(jsonString);

    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      // Array of objects
      const headers = Object.keys(data[0]);
      const rows = data.map(obj => headers.map(header => {
        const value = obj[header];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      }));
      return { headers, rows, isObjectArray: true, originalData: data };
    } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Single object
      const headers = ["Key", "Value"];
      const rows = Object.entries(data).map(([key, value]) => {
         if (typeof value === 'object' && value !== null) {
          return [key, JSON.stringify(value)];
        }
        return [key, value];
      });
      return { headers, rows, isObjectArray: false, originalData: data };
    } else if (typeof data === 'string'){
       // Simple string, not JSON structured data
       return { headers: ["Extracted Text"], rows: [[data]], isObjectArray: false, originalData: data};
    }
    return null; // Not a supported structure for table display
  } catch (error) {
    console.error("Error parsing JSON data:", error);
    return null;
  }
}


export function DataTable({ jsonData, fileName }: DataTableProps) {
  const { toast } = useToast();
  const [parsedData, setParsedData] = React.useState<ParsedData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (jsonData) {
      const result = parseJsonData(jsonData);
      if (result) {
        setParsedData(result);
        setError(null);
      } else {
        // If parsing fails or structure is not recognized, attempt to display raw string if it's not empty.
        // This could happen if AI returns a simple string instead of structured JSON.
        if (jsonData.trim() !== "" && !jsonData.startsWith("{") && !jsonData.startsWith("[")) {
           setParsedData({ headers: ["Extracted Content"], rows: [[jsonData]], isObjectArray: false, originalData: jsonData });
           setError(null);
        } else {
          setParsedData(null);
          setError("Failed to parse extracted data or the structure is not suitable for table display. The raw JSON might be malformed.");
          toast({
            variant: "destructive",
            title: "Data Parsing Error",
            description: "Could not display extracted data as a table. Please check the extraction instructions or the PDF content.",
          });
        }
      }
    } else {
      setParsedData(null);
      setError(null);
    }
  }, [jsonData, toast]);

  const handleExport = () => {
    if (!parsedData || !parsedData.originalData) {
      toast({
        variant: "destructive",
        title: "Export Error",
        description: "No data available to export.",
      });
      return;
    }

    try {
      let dataToExport = parsedData.originalData;
      if (!Array.isArray(dataToExport)) {
        // If it's a single object or just a string, wrap it for sheet generation
        if(typeof dataToExport === 'object' && dataToExport !== null) {
            dataToExport = [dataToExport];
        } else if (typeof dataToExport === 'string') {
            dataToExport = [{ "Extracted Content": dataToExport }];
        } else {
             toast({ variant: "destructive", title: "Export Error", description: "Data format not supported for Excel export."});
             return;
        }
      }
      
      // Ensure all items in array are objects, if not, map them
      if (Array.isArray(dataToExport) && dataToExport.some(item => typeof item !== 'object' || item === null)) {
        dataToExport = dataToExport.map(item => (typeof item === 'object' && item !== null) ? item : { value: item });
      }


      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ExtractedData");
      const exportFileName = fileName ? `${fileName.replace(/\.pdf$/i, "")}_extracted.xlsx` : "extracted_data.xlsx";
      XLSX.writeFile(workbook, exportFileName);
      toast({
        title: "Export Successful",
        description: `Data exported to ${exportFileName}`,
      });
    } catch (e) {
      console.error("Export failed:", e);
      toast({
        variant: "destructive",
        title: "Export Error",
        description: "An unexpected error occurred during Excel export.",
      });
    }
  };

  if (error) {
    return (
      <Card className="w-full max-w-4xl mt-8 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-6 w-6" />
            Error Displaying Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground bg-destructive/20 p-4 rounded-md">{error}</p>
          {jsonData && (
             <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">View Raw Data</summary>
                <ScrollArea className="h-40 mt-2 rounded-md border p-2">
                    <pre className="text-xs whitespace-pre-wrap break-all">{jsonData}</pre>
                </ScrollArea>
             </details>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!parsedData || parsedData.rows.length === 0) {
    return null; // No data to display or still loading initially
  }

  return (
    <Card className="w-full max-w-4xl mt-8 shadow-xl">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center text-2xl">
              <TableIcon className="mr-2 h-6 w-6 text-primary" />
              Extracted Data
            </CardTitle>
            <CardDescription>Review the data extracted from your PDF document.</CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent hover:border-accent/90 shrink-0">
            <DownloadCloud className="mr-2 h-5 w-5" />
            Export to Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {parsedData.headers.map((header, index) => (
                  <TableHead key={index} className="font-semibold">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedData.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {typeof cell === 'boolean' ? cell.toString() : cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {parsedData.rows.length === 0 && (
            <p className="text-muted-foreground text-center p-4">No structured data found to display in table format.</p>
        )}
      </CardContent>
    </Card>
  );
}
