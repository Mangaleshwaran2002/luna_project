// frontend/src/components/Accounts.tsx
import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";

// Define a type for a single user to ensure data consistency
type User = {
    id: string;
    email: string;
    // The API might return 'createdAt' as a Date object, not a string
    createdAt: Date; 
    name?: string;
    role?:string;
    username?:string;
};
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";



export default function AccountsTable() {
    // Use the User type for the users state and initialize with an empty array
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    // The error object might be of a specific type or 'null'. Use a more flexible type.
    const [error, setError] = useState<Error | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [changePasswdId, setchangePasswdId] = useState<string | null>(null);



    const handleDelete = async (userId: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setDeletingId(userId);
      const result = await authClient.admin.removeUser({
        userId
        });
      if (result.data) {
        // Handle successful deletion, e.g., re-fetch the user list
        alert("User deleted successfully!");
        // Example: Reload the page or remove the user from state
        window.location.reload(); 
      } else {
        alert(`Error: ${result.error}`);
      }
      setDeletingId(null);
    }
  };
    const ChangePasswd = async (userId: string): Promise<void> =>{
    if (window.confirm("Are you sure you want to change the password of the user?")) {
      setchangePasswdId(userId);
      const result = await authClient.admin.setUserPassword({
            newPassword: 'changeme', // required
            userId: userId, // required
      });
      if (result.data) {
        // Handle successful deletion, e.g., re-fetch the user list
        alert("User deleted successfully!");
        // Example: Reload the page or remove the user from state
        window.location.reload(); 
      } else {
        alert(`Error: ${result.error}`);
      }
      setchangePasswdId(null);
    }
  };
  
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const { data, error } = await authClient.admin.listUsers({
                query: {
                    limit: 100,
                    sortBy: "name",
                },
            });

            if (error) {
                console.error("Error fetching users:", error);
                setError(new Error(error.message));
            } else if (data?.users) {
                // Ensure the fetched data (UserWithRole[]) is compatible with User[]
                setUsers(data.users as User[]);
                console.log(data.users);
            }
            setLoading(false);
        };

        fetchUsers();
        
    }, []);

    if (loading) {
        return <div className="p-8">Loading users...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-600">Error: {error.message}</div>;
    }

// return (
//     <div className="p-6 w-screen md:w-10/12 ">
//       <h1 className=" text-xl md:text-2xl font-semibold md:mb-4">User Accounts</h1>

//       {users.length > 0 ? (
//         <>
//           <div className="rounded-md border  overflow-hidden shadow-sm ">
//             <Table className="md:p-10 space-y-3">
//               <TableCaption>A list of all registered users.</TableCaption>
//               <TableHeader className="">
//                 <TableRow >
//                   <TableHead className="mx-2">Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Username</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead>Created At</TableHead>
//                   <TableHead className="text-center">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody className="md:mx-10">
//                 {users.map((user) => (
//                   <TableRow key={user.id} className="transition-colors hover:bg-muted/30">
//                     <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
//                     <TableCell className="text-sm">{user.email}</TableCell>
//                     <TableCell>
//                       <span className="text-sm font-mono text-gray-600">{user.username || "N/A"}</span>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={user.role === "admin" ? "destructive" : "default"}>
//                         {user.role === "admin" ? "Admin" : "User"}
//                         </Badge>
//                     </TableCell>
//                     <TableCell>
//                       {new Date(user.createdAt).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell className="text-right space-y-2 md:space-y-0 flex flex-col md:flex-row gap-2 md:gap-3 justify-center">
//                       <Button
//                         size="sm"
//                         onClick={() => handleDelete(user.id)}
//                         disabled={deletingId === user.id}
//                         className="w-full md:w-auto bg-red-600 "
//                       >
//                         {deletingId === user.id ? "Deleting..." : "Delete"}
//                       </Button>
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         onClick={() => ChangePasswd(user.id)}
//                         disabled={changePasswdId === user.id}
//                         className="w-full md:w-auto"
//                       >
//                         {changePasswdId === user.id ? "Changing..." : "Change Password"}
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>

//         </>
//       ) : (
//         <p className="text-muted-foreground">No users found.</p>
//       )}
//     </div>
//   );
return (
  <div className="p-6 w-screen md:w-10/12">
    <h1 className="text-xl md:text-2xl font-semibold md:mb-4">User Accounts</h1>

    {users.length > 0 ? (
      <>
        {/* TABLE — Visible on medium and larger screens */}
        <div className="rounded-md border overflow-hidden shadow-sm hidden md:block">
          <Table className="md:p-10 space-y-3">
            <TableCaption>A list of all registered users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="mx-2">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="md:mx-10">
              {users.map((user) => (
                <TableRow key={user.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-gray-600">{user.username || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                    // variant={user.role === "admin" ? "destructive" : "default"}
                    className={`${user.role === "admin" ? "bg-red-500" : "bg-blue-500"}`}>
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-y-2 md:space-y-0 flex flex-col md:flex-row gap-2 md:gap-3 justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => ChangePasswd(user.id)}
                      disabled={changePasswdId === user.id}
                      className="w-full md:w-auto"
                    >
                      {changePasswdId === user.id ? "Changing..." : "Change Password"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                      className="w-full md:w-auto bg-red-600"
                    >
                      {deletingId === user.id ? "Deleting..." : "Delete"}
                    </Button>
                    
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* CARDS — Visible only on small/mobile screens */}
        <div className="space-y-4 block md:hidden">
          {users.map((user) => (
            <Card key={user.id} className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{user.name || "N/A"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs font-bold">Username</span>
                  <p className="font-mono text-sm text-gray-600">{user.username || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold mx-3">Role </span>
                  <Badge 
                  // variant={user.role === "admin" ? "destructive" : "default"} 
                  className={`${user.role === "admin" ? "bg-red-500" : "bg-blue-500"}`}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs font-bold">Created At</span>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col space-y-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => ChangePasswd(user.id)}
                    disabled={changePasswdId === user.id}
                    className="w-full"
                  >
                    {changePasswdId === user.id ? "Changing..." : "Change Password"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    disabled={deletingId === user.id}
                    className="w-full bg-red-600"
                  >
                    {deletingId === user.id ? "Deleting..." : "Delete"}
                  </Button>
                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    ) : (
      <p className="text-muted-foreground">No users found.</p>
    )}
  </div>
)
}

