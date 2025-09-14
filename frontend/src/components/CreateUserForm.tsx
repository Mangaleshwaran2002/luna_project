// frontend/src/components/AdminDashboard.tsx
import { useState } from "react";
import { authClient } from "../lib/auth-client";
import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
// Define a type for the possible roles
type Role = "user" | "admin";
// import {    
//     AlertDialogAction,
//    AlertDialogCancel} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export default function CreateUserForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        role: "user" as Role,
    });

    // ✅ Dedicated handler for role select
    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            role: value as Role,
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const password = "changeme";

        const { data, error } = await authClient.admin.createUser({
            email: formData.email,
            password,
            name: formData.name,
            role: formData.role,
            data: {
                username: formData.username.toLowerCase(),
                displayUsername: formData.username,
            },
        });

        setLoading(false);
        navigate('/admin')

        if (error) {
            console.error(error);
            alert(`Error creating user: ${error.message}`);
        } else if (data) {
            alert(`User '${data.user.name}' with role '${data.user.role}' created successfully! Initial password is 'changeme'.`);
            setFormData({ name: "", email: "", username: "", role: "user" });
            window.location.reload();          

        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        // ... your JSX remains unchanged ...
        <div className="flex flex-col items-center justify-center p-6 max-w-md text-black ring-2 rounded-md mx-2 md:mx-auto my-5 md:my-9">
            <form onSubmit={handleCreateUser} className="w-full space-y-3 md:space-y-6">
                <div className="grid gap-2">
                    <Label className="text-md font-semibold" htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Enter fullname"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-md font-semibold" htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        name="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-md font-semibold" htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2 md:gap-3">
                    <Label className="text-md font-semibold" htmlFor="role">Role</Label>
                    <Select name="role" value={formData.role} onValueChange={handleRoleChange}  >
                        <SelectTrigger id="role" className="w-full">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-5 w-full justify-center">
                
                <Button type="submit" >
                    Create User
                </Button>
                </div>
                
            </form>
        </div>
    );
}
