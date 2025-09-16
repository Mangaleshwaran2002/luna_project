import React, { useEffect, useState } from 'react';
import axios from '../utils/axios_config'; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from 'react-router-dom';

// Define Client interface matching your backend schema
interface Client {
  _id?: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  contact: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}


const ClientUpdateForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL route params

  // State for form fields
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Client['gender'] | ''>('');
  const [contact, setContact] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Fetch existing client data on component mount
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientIdToFetch = id;
        if (!clientIdToFetch) return;

        const response = await axios.get(`/api/clients/${clientIdToFetch}`);
        const client: Client = response.data;

        setName(client.name || '');
        setAge(client.age || '');
        setGender(client.gender || '');
        setContact(client.contact || '');
        setAddress(client.address || '');
      } catch (error: any) {
        console.error('Error fetching client:', error);
        setMessage(error.response?.data?.message || 'Failed to load client data.');
        setMessageType('error');
      }
    };

    fetchClient();
    return ()=>{
        setName('');
        setAge('');
        setGender('');
        setContact('');
        setAddress('');
    }
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      const clientIdToSubmit = id;
      if (!clientIdToSubmit) {
        throw new Error('Client ID is missing');
      }

      // Prepare data payload — only include fields that are filled
      const dataToSend: Partial<Client> = {
        name: name.trim() || undefined,
        age: typeof age === 'number' ? age : undefined,
        gender: gender || undefined,
        contact: contact.trim() || undefined,
        address: address.trim() || undefined,
      };

      // Validate required fields (you can extend this logic)
      if (!dataToSend.name) {
        throw new Error('Name is required');
      }

      // Make PUT request to update client
      const response = await axios.put(`/api/clients/${clientIdToSubmit}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setMessage('Client updated successfully!');
        setMessageType('success');
        
        // Redirect after success
        setTimeout(() => {
          navigate('/clients'); // Adjust route as needed
        }, 1500);
      }else{
        setMessage(`Error: ${response.data}, Status code : ${response.status}`);
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Error updating client:', error);

      let errorMsg = 'Failed to update client. Please try again.';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMsg = error.response.data.errors.join(', ');
      }

      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Client</h2>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter client name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={age === '' ? '' : age}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
            placeholder="Enter age"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender || undefined} onValueChange={(value) => setGender(value as Client['gender'])}>
            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter full address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Update Client'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ClientUpdateForm;