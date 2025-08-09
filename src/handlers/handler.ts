import service from "../services/service";
import { Env } from '../domain/types/type';
// Import ExecutionContext type for Cloudflare Workers
import type { ExecutionContext } from '@cloudflare/workers-types';

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // const env: Env = {
        //     LLM_API_KEY: process.env.LLM_API_KEY ?? (() => { throw new Error("LLM_API_KEY is not set"); })(),
        //     LLM_API_URL: process.env.LLM_API_URL ?? (() => { throw new Error("LLM_API_URL is not set"); })(),
        //     LLM_MODEL: process.env.LLM_MODEL ?? (() => { throw new Error("LLM_MODEL is not set"); })()
        // };

        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        const { destination, durationDays } = await request.json();
        if (!destination || !durationDays) {
            return new Response("Invalid request body", { status: 400 });
        }

        return await service.DoReqToLLM(destination, durationDays, env, ctx);
    }
}