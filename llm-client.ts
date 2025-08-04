import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const API_URL = 'https://api.together.xyz/v1/chat/completions';
const MODEL = 'meta-llama/Llama-3-8b-chat-hf';
let timeoutMs = 1500;

export async function fetchLLMResponse(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching LLM response: ${await response.text()}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}