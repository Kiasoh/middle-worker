import { getLLMResponse } from "../repositories/llm_repo";
import type { Env } from "../domain/types/type";
import { ExecutionContext } from "@cloudflare/workers-types";
import { generateUUID } from "../utils/util";
import { setStatus, createJob, setError, setItinerary } from "../repositories/firestore_repo";

let TIMEOUT_MS = 5000;

export default {
    async DoReqToLLM(destination: string, durationDays: number, env: Env, ctx: ExecutionContext): Promise<Response> {
        
        if (!env.LLM_API_KEY || !env.LLM_API_URL || !env.LLM_MODEL) {
            console.error(`Missing required environment variables: ${env.LLM_API_KEY}, ${env.LLM_API_URL}, ${env.LLM_MODEL}`);
            return new Response('Missing required environment variables', { status: 500 });
        }

        const jobid = generateUUID();
        // could run processing status concurrently but i am afraid of some sort of race condition. tcp scares me.
        ctx.waitUntil(
            
            createJob(jobid,destination,durationDays, env).then(() => {
            
                this.ContactLLM(destination, durationDays, env).then(async response => {
                console.log('LLM Response:', response);
                  let itinerary: any[] = [];
                  try {
                      itinerary = JSON.parse(response);
                  } catch (e) {
                      console.error('Failed to parse LLM response as JSON:', e);
                      setError(jobid, 'Failed to parse LLM response', env);
                      return;
                  }
                  setItinerary(jobid, itinerary, env);
                }).catch(async error => {
                  console.error('Error in DoReqToLLM:', error);
                  setError(jobid, error.message, env);
                })
            }).catch(async error => {
              console.error('Error creating job:', error);
              setError(jobid, error.message, env);
            })
        );


        return new Response(`${jobid}`, { status: 202 });

    },
    async ContactLLM(destination: string, durationDays: number, env: Env) {

        const prompt = `Generate a travel itinerary for ${destination} for ${durationDays} days. your response should be in JSON format with the following structure:
  [
    {
      "day": 1,
      "theme": "Historical Paris",
      "activities": [
        {
          "time": "Morning",
          "description": "Visit the Louvre Museum. Pre-book tickets to avoid queues.",
          "location": "Louvre Museum"
        },
        {
          "time": "Afternoon",
          "description": "Explore the Notre-Dame Cathedral area and walk along the Seine.",
          "location": "Île de la Cité"
        },
        {
          "time": "Evening",
          "description": "Dinner in the Latin Quarter.",
          "location": "Latin Quarter"
        }
      ]
    }
    // ... additional days
  ],
. Ensure the response is well-structured and includes all necessary details for each day. do not include any additional text outside the JSON structure.`;

        try {
            const response = await getLLMResponse(
                prompt,
                {
                    LLM_API_KEY: env.LLM_API_KEY,
                    LLM_API_URL: env.LLM_API_URL,
                    MODEL: env.LLM_MODEL
                },
                TIMEOUT_MS
            );
            return response;
        } catch (error: any) {
            console.error('Error fetching LLM response:', error);
            throw new Error(`Failed to fetch LLM response: ${error.message}`);
        }
 
    }
}