import { Env } from "../domain/types/type";
import axios from 'axios';

// const getFirestoreUrl = (projectId: string, path: string, updateFields?: string[]) => {
//     const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
//     let url = `${base}/${path}`;
//     if (updateFields && updateFields.length > 0) {
//         url += `?updateMask.fieldPaths=${updateFields.join(",")}`;
//     }
//     return url;
// };
const getFirestoreUrl = (projectId: string, path: string, updateFields?: string[]) => {
    const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
    let url = `${base}/${path}`;
    if (updateFields && updateFields.length > 0) {
        const query = updateFields
            .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
            .join("&");
        url += `?${query}`;
    }
    return url;
};


export async function getIdToken(env: Env): Promise<string> {
    // const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${env.FIREBASE_API_KEY}`

    // const response = await axios.post(url, {
    //     returnSecureToken: true
    // })

    // return response.data.idToken
    try {
        const res = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${env.FIREBASE_API_KEY}`,
            {
                returnSecureToken: true,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("ID Token:", res.data.idToken);
        return res.data.idToken;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.error("Error getting ID token:", err.response?.data || err.message);
        } else {
            console.error("Error getting ID token:", (err as Error).message);
        }
    }
    throw new Error("Failed to get ID token");
}

async function updateJobField(jobId: string, fields: Record<string, any>, env: Env) {

    const token = getIdToken(env);
    const url = getFirestoreUrl(env.FIREBASE_PROJECT_ID, `jobs/${jobId}`, Object.keys(fields));

    const body = {
        fields: Object.fromEntries(
            Object.entries(fields).map(([key, value]) => [
                key,
                typeof value === "string"
                    ? { stringValue: value }
                    : typeof value === "number"
                        ? { integerValue: value }
                        : value instanceof Array
                            ? {
                                arrayValue: {
                                    values: value.map(v => ({
                                        stringValue: JSON.stringify(v),
                                    })),
                                },
                            }
                            : value === null
                                ? { nullValue: null }
                                : { stringValue: JSON.stringify(value) },
            ])
        ),
    };

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${await token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update job field: ${errorText}`);
    }
}

type ItineraryActivity = {
    time: string;
    description: string;
    location: string;
};

type ItineraryDay = {
    day: number;
    theme: string;
    activities: ItineraryActivity[];
};

type JobDoc = {
    status: "completed" | "processing" | "failed";
    destination: string;
    durationDays: number;
    createdAt: any;
    completedAt: any | null;
    itinerary: ItineraryDay[];
    error: string | null;
};

export async function setStatus(
    jobId: string,
    status: "completed" | "processing" | "failed",
    env: any
) {
    await updateJobField(jobId, { status }, env);
}

export async function setError(jobId: string, error: string, env: any) {
    await updateJobField(jobId, { error, status: "failed" }, env);
}

export async function createJob(
    jobId: string,
    destination: string,
    durationDays: number,
    env: any
) {
    const job: JobDoc = {
        status: "processing",
        destination,
        durationDays,
        createdAt: new Date().toISOString(),
        completedAt: null,
        itinerary: [],
        error: null,
    };

    await updateJobField(jobId, job, env);
}

export async function setCompleted(jobId: string, completedAt: any, env: any) {
    await updateJobField(jobId, { status: "completed", completedAt }, env);
}

export async function setItinerary(
    jobId: string,
    itinerary: ItineraryDay[],
    env: any
) {
    await updateJobField(
        jobId,
        {
            status: "completed",
            completedAt: new Date().toISOString(),
            itinerary,
            error: null,
        },
        env
    );
}
