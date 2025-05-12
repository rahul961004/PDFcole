// The use server directive must be at the top of the file.
'use server';

/**
 * @fileOverview Extracts data from a PDF document using AI.
 *
 * - extractDataFromPdf - A function that handles the data extraction process from a PDF.
 * - ExtractDataFromPdfInput - The input type for the extractDataFromPdf function.
 * - ExtractDataFromPdfOutput - The return type for the extractDataFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  extractionInstructions: z
    .string()
    .describe(
      'Instructions on what data to extract from the PDF. Be as specific as possible.'
    ),
});
export type ExtractDataFromPdfInput = z.infer<typeof ExtractDataFromPdfInputSchema>;

const ExtractDataFromPdfOutputSchema = z.object({
  extractedData: z
    .string()
    .describe('The extracted data from the PDF, formatted as a JSON string.'),
});
export type ExtractDataFromPdfOutput = z.infer<typeof ExtractDataFromPdfOutputSchema>;

export async function extractDataFromPdf(input: ExtractDataFromPdfInput): Promise<ExtractDataFromPdfOutput> {
  return extractDataFromPdfFlow(input);
}

const extractDataFromPdfPrompt = ai.definePrompt({
  name: 'extractDataFromPdfPrompt',
  input: {schema: ExtractDataFromPdfInputSchema},
  output: {schema: ExtractDataFromPdfOutputSchema},
  prompt: `You are an expert data extractor specializing in extracting information from PDF documents.

You will use this information to extract the data specified by the user, and format it as a JSON string.

Instructions: {{{extractionInstructions}}}

PDF Document: {{media url=pdfDataUri}}`,
});

const extractDataFromPdfFlow = ai.defineFlow(
  {
    name: 'extractDataFromPdfFlow',
    inputSchema: ExtractDataFromPdfInputSchema,
    outputSchema: ExtractDataFromPdfOutputSchema,
  },
  async input => {
    const {output} = await extractDataFromPdfPrompt(input);
    return output!;
  }
);
