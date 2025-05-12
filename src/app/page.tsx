import * as React from "react";
import FileUploadForm from "@/components/FileUploadForm";
import ModelSelect from "@/components/ModelSelect";
import DataTable from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

export default function Home() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<string>("gpt-4o-mini high");
  const [extractedData, setExtractedData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please upload a PDF file before extracting.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData([]);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("model", selectedModel);

      // Replace with your Firebase Cloud Function URL
      const response = await fetch("/api/extract-data", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract data.");
      }

      const data = await response.json();
      setExtractedData(data.extractedData);

      toast({
        title: "Extraction Complete",
        description: "Data extracted successfully.",
      });

    } catch (error: any) {
      console.error("Extraction error:", error);
      const errorMessage = error.message || "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  const handleDownloadExcel = () => {
    if (extractedData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Download",
        description: "Extract data first before attempting to download.",
      });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(extractedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");
    XLSX.writeFile(workbook, "extracted_data.xlsx");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DocuExtract</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FileUploadForm onFileUpload={handleFileUpload} />
        <ModelSelect onModelSelect={handleModelSelect} selectedModel={selectedModel} />
      </div>

      <Button onClick={handleExtract} disabled={isLoading || !selectedFile}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          "Extract Data"
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {extractedData.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Extracted Data</h2>
          <DataTable data={extractedData} />
          {extractedData.length > 0 && (
            <Button onClick={handleDownloadExcel} className="mt-2">
              Download as Excel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
