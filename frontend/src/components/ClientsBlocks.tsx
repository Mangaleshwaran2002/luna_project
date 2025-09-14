import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/Auth";
import axios from "../utils/axios_config";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define TypeScript interface for client data
interface Client {
  _id: string;
  name: string;
  age: number;
  gender: "male" | "female" | string;
  contact: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  normalizedName: string;
}

const ClientsBlocks: React.FC = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const { user } = useAuth();
  const handleDelete = async (clientId: string): Promise<void> => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        try {
        const response = await axios.delete(`/api/clients/${clientId}`);
        
        if(response.status === 200){
            console.log('record deleted successfully')
        }
        setClients(clients.filter((client) => client._id !== clientId));
        } catch (err: any) {
        console.error("Error deleting record:", err);
        alert("Failed to delete record. Please try again.");
        }
     }
    };

  // Fetch clients data on mount
  useEffect(() => {
    const fetchClients = async () => {
      if (user?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      try {
        setLoading(true);
        const response = await axios.get<Client[]>("/api/clients/");
        
        if (response.status === 200) {
          setClients(response.data);
          console.debug("Fetched clients:", response.data);
        } else {
          throw new Error(`Unexpected status: ${response.status}`);
        }
      } catch (err: any) {
        console.error("Error fetching clients:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
    return ()=>{
    setClients([]);
    setLoading(false);
    setError(null);
    }
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (isAdmin === null) {
    return <div className="text-center py-8">Authenticating...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-4 sm:p-6 md:mx-10 text-center text-gray-600">
        You are not authorized to view this page.
      </div>
    );
  }
  return (<>
  <div className="flex items-center justify-center p-8">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-10/12 md:w-6/12">
        {clients.length > 0 ? (
          clients.map((client) => (
            <Card key={client._id}
            className="relative border transition-all duration-100 hover:border-muted-foreground hover:shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-gray-100 py-0">
               <CardContent className="flex space-x-4 p-4 w-auto justify-around md:justify-center">
                <div className="text-xl md:text-md space-y-2 flex justify-center flex-col">
                  <div className="flex justify-center">
                      <Avatar className="h-20 w-20">
                      <AvatarImage src={''} alt={client.name} />
                      <AvatarFallback className="capitalize">{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>

                <p className="space-x-2 text-center"><span className="text-xl  md:text-md font-bold md:font-semibold capitalize">{client.name}</span></p>
                <p className="space-x-2"><span className="text-xl  md:text-md font-bold md:font-semibold">Age:</span> <span>{client.age}</span></p>
                <p className="space-x-2"><span className="text-xl  md:text-md font-bold md:font-semibold">Gender:</span> <span>{client.gender}</span></p>
                <p className="space-x-2"><span className="text-xl  md:text-md font-bold md:font-semibold">Contact:</span><span>{client.contact}</span> </p>
                <p className="space-x-2"><span className="text-xl  md:text-md font-bold md:font-semibold">Address:</span><span>{client.address || "--"}</span> </p>
                <p className="text-lg font-semibold md:text-md text-gray-500">
                  Created: {new Date(client.createdAt).toLocaleDateString()}
                </p>
                <div className="space-x-2 flex">
                    <Button variant={'ghost'} className="w-6/12 ring hover:ring-2 hover:ring-blue-300 hover:ring-offset-2" onClick={()=> navigate(`/clients/update/${client._id}`)}>
                        <Edit color="blue"/>
                    </Button>
                    <Button variant={'ghost'} className="w-6/12 ring hover:ring-2 hover:ring-red-300 hover:ring-offset-2" onClick={()=> handleDelete(client._id)}>
                        <Trash2 color="red" />
                    </Button>
                </div>
               </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500">No clients found.</p>
        )}
    </div>
  </div>
  </>)

};

export default ClientsBlocks;

