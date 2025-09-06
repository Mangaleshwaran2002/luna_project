import { createAuthClient } from "better-auth/react"
import { adminClient,usernameClient } from "better-auth/client/plugins"

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: apiBaseUrl ,
    plugins: [
        adminClient(),
        usernameClient() 
    ]
})