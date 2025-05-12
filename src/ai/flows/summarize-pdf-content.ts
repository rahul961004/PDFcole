'use server';

/**
 * @fileOverview Summarizes the content of a PDF document.
 *
 * - summarizePdfContent - A function that handles the PDF summarization process.
 * - SummarizePdfContentInput - The input type for the summarizePdfContent function.
 * - SummarizePdfContentOutput - The return type for the summarizePdfContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePdfContentInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type SummarizePdfContentInput = z.infer<typeof SummarizePdfContentInputSchema>;

const SummarizePdfContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF document.'),
});
export type SummarizePdfContentOutput = z.infer<typeof SummarizePdfContentOutputSchema>;

export async function summarizePdfContent(input: SummarizePdfContentInput): Promise<SummarizePdfContentOutput> {
  return summarizePdfContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePdfContentPrompt',
  input: {schema: SummarizePdfContentInputSchema},
  output: {schema: SummarizePdfContentOutputSchema},
  prompt: `You are an expert summarizer of PDF documents.  You will be provided the contents of a PDF document.  You will summarize the document, providing a concise overview of the key points, so that the user can quickly understand the document\'s purpose and main ideas without needing to read it in its entirety.

Use the following as the primary source of information about the PDF document.

PDF Document: {{media url=pdfDataUri}}`,
});

const summarizePdfContentFlow = ai.defineFlow(
  {
    name: 'summarizePdfContentFlow',
    inputSchema: SummarizePdfContentInputSchema,
    outputSchema: SummarizePdfContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
