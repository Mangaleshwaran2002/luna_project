// frontend/src/components/SignUp.tsx
import { authClient } from "../lib/auth-client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/Auth";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
    const { setUser, setSession } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    
    // Use an object to manage all form data with a single state
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    // Handle changes to the form inputs and update the state
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Handle the form submission
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!formData.username || !formData.password) {
        alert("Please fill in all fields.");
        return;
      }

      setLoading(true);

      try {
        // Step 1: Sign in
        const { data: loginData, error: loginError } = await authClient.signIn.username({
          username: formData.username,
          password: formData.password,
        });

        if (loginError) {
          console.error("Login error:", loginError);
          alert(loginError.message);
          return;
        }

        if (loginData) {
          console.log("Login successful:", loginData);

          // Step 2: Fetch full session (includes session + user)
          const { data: sessionData, error: sessionError } = await authClient.getSession();

          if (sessionError || !sessionData) {
            console.error("Failed to fetch session after login:", sessionError);
            alert("Login successful, but failed to load session. Please refresh.");
            return;
          }

          // Step 3: Now update context with correct data
          setUser(sessionData.user);
          setSession(sessionData.session);

          // Step 4: Navigate home
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Unexpected error during login:", err);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
        return (<div>Loading...</div>);
    }

    return (
      <div className="flex items-center justify-center p-5 w-screen">
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground">
              
            </div>
          </CardFooter>
        </Card>
      </div>
    );
}