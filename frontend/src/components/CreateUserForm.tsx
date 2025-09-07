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
import {    
    AlertDialogAction,
   AlertDialogCancel} from "@/components/ui/alert-dialog"

export default function CreateUserForm() {
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

        if (error) {
            console.error(error);
            alert(`Error creating user: ${error.message}`);
        } else if (data) {
            alert(`User '${data.user.name}' with role '${data.user.role}' created successfully! Initial password is 'changeme'.`);
            setFormData({ name: "", email: "", username: "", role: "user" });
            window.location.reload();
            // setTimeout(() => {
                
            // }, 1000);
            

        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        // ... your JSX remains unchanged ...
        <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto text-black">
            <form onSubmit={handleCreateUser} className="w-full space-y-3 md:space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
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
                    <Label htmlFor="email">Email</Label>
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

                <div className="grid gap-2 place-items-center">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" value={formData.role} onValueChange={handleRoleChange} >
                        <SelectTrigger id="role" className="w-6/12">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-5 w-full justify-center">
                <AlertDialogCancel className="capitalize text-black">cancel</AlertDialogCancel>
                <AlertDialogAction type="submit" >
                    Create User
                </AlertDialogAction>
                </div>
                
            </form>
        </div>
    );
}
