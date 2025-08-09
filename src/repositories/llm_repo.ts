export async function getLLMResponse(prompt: string, env: {LLM_API_KEY: string, LLM_API_URL: string, MODEL: string,}, TIMEOUT_MS: number): Promise<string> {
    const API_KEY = env.LLM_API_KEY;
    const API_URL = env.LLM_API_URL;
    const MODEL = env.MODEL;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
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
            signal: controller.signal,
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


