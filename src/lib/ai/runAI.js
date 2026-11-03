import { base44 } from '@/api/base44Client';

const RETRY_NOTE = `RETRY — your previous answer was empty or did not satisfy the schema. Return one populated JSON object that includes every required field. Use null for any value you could not verify; never invent data.`;

const isUsable = (value) =>
  value != null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;

/**
 * Single hardened entry point for structured AI calls.
 * Retries once on an empty or failed response so a transient model or
 * search failure doesn't surface as a blank report to the user.
 */
export async function runAI({
  prompt,
  schema,
  fileUrls = [],
  webSearch = true,
  attempts = 2,
  model,
}) {
  let lastError = new Error('The AI did not return a usable result.');

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: attempt === 1 ? prompt : `${prompt}\n\n${RETRY_NOTE}`,
        add_context_from_internet: webSearch,
        file_urls: fileUrls.length ? fileUrls : undefined,
        response_json_schema: schema,
        ...(model ? { model } : {}),
      });

      if (isUsable(response)) return response;
      lastError = new Error('The AI returned an empty result. Please try again.');
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
  }

  throw lastError;
}