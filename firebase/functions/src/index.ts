// This file will contain the Firebase Cloud Functions for the DocuExtract application.
// Functions related to AI processing and data extraction will be added here.
import * as functions from 'firebase-functions';
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { configureGenkit } from '@genkit-ai/core';
import { openai } from '@genkit-ai/openai';
import * as z from 'zod';
import 'dotenv/config'

admin.initializeApp();

// Configure Genkit with the OpenAI model
configureGenkit({
  plugins: [
    openai({
      apiKey: process.env.OPENAI_API_KEY, // Ensure your OpenAI API key is set as an environment variable
    }),
  ],
  logLevel: 'info',
  flowStateStore: 'firebase',
});

// Define the input and output schema for the function
const ExtractDataInput = z.object({
  fileContent: z.string(), // Base64 encoded file content
  model: z.string(),
});

const ExtractedDataItem = z.object({
  'Part number': z.string().optional(),
  'product description': z.string().optional(),
  'quantity shipped': z.string().optional(),
  'total value line wise': z.string().optional(),
  'total shipment value': z.string().optional(),
});

const ExtractDataOutput = z.array(ExtractedDataItem);

export const extractDataFromPdf = onCall(
  { enforceAppCheck: false, cors: true, consumeAppCheckToken: true },
  async (request) => {
    const { fileContent, model } = ExtractDataInput.parse(request.data);
    // Further implementation will go here to process the file content
    // and use the Agent SDK to extract data.
  });