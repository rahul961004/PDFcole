"use client";

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, Wand2 } from "lucide-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const formSchema = z.object({
  pdfFile: z
    .custom<FileList>()
    .refine((files) => files && files.length === 1, "PDF file is required.")
    .refine((files) => files && files[0].size <= MAX_FILE_SIZE, `Max file size is ${MAX_FILE_SIZE / (1024*1024)}MB.`)
    .refine(
      (files) => files && ACCEPTED_FILE_TYPES.includes(files[0].type),
      "Only .pdf files are accepted."
    ),
  extractionInstructions: z.string().min(10, "Extraction instructions must be at least 10 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

interface PdfUploadFormProps {
  onExtract: (pdfDataUri: string, instructions: string, fileName: string) => Promise<void>;
  isLoading: boolean;
}

export function PdfUploadForm({ onExtract, isLoading }: PdfUploadFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      extractionInstructions: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const file = data.pdfFile[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target && typeof e.target.result === "string") {
        await onExtract(e.target.result, data.extractionInstructions, file.name);
        form.reset(); 
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Upload PDF & Specify Data
        </CardTitle>
        <CardDescription>
          Upload your PDF document and tell us what information you want to extract.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pdfFile"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel htmlFor="pdfFile">PDF Document</FormLabel>
                  <FormControl>
                    <Input
                      id="pdfFile"
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => onChange(e.target.files)}
                      className="file:text-primary file:font-semibold hover:file:bg-primary/10"
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extractionInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="extractionInstructions">Extraction Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      id="extractionInstructions"
                      placeholder="e.g., 'Extract all names, email addresses, and phone numbers from the document into a table format.' or 'Find the total invoice amount and due date.'"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                "Extracting..."
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Extract Data
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
