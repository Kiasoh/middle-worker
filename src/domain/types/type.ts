export type Env = {
    LLM_API_KEY: string;
    LLM_API_URL: string;
    LLM_MODEL: string;
    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
};

export type Itinerary = {
    day: number;
    theme: string;
    activities: {
        time: string;
        description: string;
        location: string;
    }[];
};
