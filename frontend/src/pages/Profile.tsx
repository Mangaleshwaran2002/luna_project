// frontend/src/components/Dashboard.tsx
import { Button } from "@/components/ui/button";
import { authClient } from "../lib/auth-client";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {  RotateCcwKey } from "lucide-react";


// Redefine the Session type to match the structure returned by getSession()
type SessionData = {
    session: {
        token: string;
    };
    user: {
        name: string;
        email: string;
        role:string;
        displayUsername:string;
        username:string;
        // ... other user properties
    };
};

export default function Profile() {

    // State to hold the entire session data object
    const [sessionData, setSessionData] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Fetch the user session when the component mounts
    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const { data, error: authError } = await authClient.getSession();

                if (authError) {
                    console.error("Session error:", authError);
                    setError(authError.message ?? 'An unknown error occurred.');
                } else if (data) {
                    console.log("Session data:", data);
                    // Store the entire data object
                    setSessionData(data as SessionData);
                }
            } catch (e: any) {
                console.error("Unexpected error:", e);
                setError(e.message ?? "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserSession();
    }, []);

    if (loading) {
        return <div className="p-4 text-center">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
    }

    if (!sessionData) {
        return <div className="p-4 text-gray-500 text-center">You are not logged in.Please login. <Link
                    to="/login"
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                    Login
                </Link></div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md my-2 sm:my-3">
                <p className="text-lg">
                    Hi, <span className="font-semibold">{sessionData.user.name}</span>!
                </p>
                <p className="text-gray-600 mt-2">
                    Your email: <span className="font-medium">{sessionData.user.email}</span>
                </p>
                <p className="text-gray-600 mt-2">
                    username : <span className="font-medium">{sessionData.user.username}</span>
                </p>
                <p className="text-gray-600 mt-2">
                    Displayname : <span className="font-medium">{sessionData.user.displayUsername}</span>
                </p>


                <p className="text-gray-600 mt-2">
                    Role: <span className="font-medium">{sessionData.user.role}</span>
                </p>
                <div className="md:mt-4 flex gap-3">
                    <Button variant={'outline'} className="px-4 py-2  text-sm font-medium rounded  transition">
                    <Link
                      to="/changepasswd"
                      className="flex gap-1 md:gap-2"
                    >
                      <RotateCcwKey className="mt-0.5 capitalize" /><span>change password</span>
                    </Link>
                    </Button>
                </div>

            </div>

        </div>
    );
}
