import React, { useEffect, useState } from 'react';
import axios from '../utils/axios_config';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react";
import { authClient } from "../lib/auth-client"; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
// Define the appointment interface as provided
interface Appointment {
  start?: string; 
  end?: string; 
  platform?: "website" | "phone" | "in-person" | "whatsapp" | "instagram" | "";
  type?: "consultation" | "treatment" | "maintenance" | "";
  status?: "completed" | "cancelled" | "rescheduled" | "";
  scheduleBy? : String;
}

// Define component props
interface AppointmentUpdateProps {
  appointmentId?: string | null;
}

const AppointmentUpdateForm: React.FC<AppointmentUpdateProps> = ({ appointmentId }) => {
  const navigate = useNavigate()
  // State for date and time separately
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string | ''>('10:00:00');
  const [endTime, setEndTime] = useState<string | ''>('11:00:00');
  const [scheduleBy, setScheduleBy] = useState<string | ''>('admin');

  
  // State for other form fields based on the Appointment interface
  const [platform, setPlatform] = useState<Appointment["platform"] | ''>('');
  const [type, setType] = useState<Appointment["type"] | ''>('');
  const [status, setStatus] = useState<Appointment["status"] | ''>('');
  
  // State to manage loading and success/error messages
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // Combine date and time into ISO string
  const combineDateTime = (date: Date | undefined, time: string): string | '' => {
    if (!date || !time) return '';
    const [hours, minutes, seconds] = time.split(':');
    const combined = new Date(date);
    combined.setHours(Number(hours), Number(minutes), Number(seconds || 0), 0);
    return combined.toISOString();
  };
  const handleUser = async()=>{
    const { data: sessionData, error } = await authClient.getSession();
    if(error){
      console.error(error)
    }
    if(sessionData){
      setScheduleBy(sessionData.user.username || 'admin')
    }

  }
  useEffect(  () => {
    handleUser();
  },[])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      // Combine date with start and end times
      const start = combineDateTime(startDate, startTime);
      const end = combineDateTime(startDate, endTime);
      
      // Create data object with only non-empty fields
      const dataToSend: Partial<Appointment> = {};
      
      if (start) dataToSend.start = start;
      if (end) dataToSend.end = end;
      if (platform) dataToSend.platform = platform;
      if (type) dataToSend.type = type;
      if (status) dataToSend.status = status;
      dataToSend.scheduleBy = scheduleBy;
      // Make the PUT request using Axios
      // FIXED: Changed URL from localhost:5173 to localhost:5000
      const response = await axios.put(`/api/appointments/${appointmentId}`, dataToSend, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // ✅ Remove the if(response.status === 200) — Axios will throw on non-2xx
        if(response.status === 200){
        alert('Appointment updated successfully!');
        setMessage('Appointment updated successfully!');

        setMessageType('success');
        navigate('/');
        }
        


      // Reset form after successful submission
      setStartDate(undefined);
      setStartTime('');
      setEndTime('');
      setPlatform('');
      setType('');
      setStatus('');
      window.location.reload()
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      setMessage(error.response?.data?.message || 'Failed to update appointment. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Appointment</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal">
                {startDate ? startDate.toLocaleDateString('en-GB') : 'Select date'}
                <ChevronDownIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={startDate} 
                onSelect={setStartDate} 
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Start and End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Time */}
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              step="1"
              value={startTime}
              onChange={(e) => {
                console.log(e.target.value);
                setStartTime(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
          
          {/* End Time */}
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input
              type="time"
              step="1"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <select
            id="platform"
            value={platform || ''}
            onChange={(e) => setPlatform(e.target.value as Appointment["platform"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitakize"
          >
            <option value="">select Platform</option>
            <option value="website">Website</option>
            <option value="phone">Phone</option>
            <option value="in-person">In-person</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        {/* Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            value={type || ''}
            onChange={(e) => setType(e.target.value as Appointment["type"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitakize"
          >
            <option value="">select Type</option>
            <option value="consultation">Consultation</option>
            <option value="treatment">Treatment</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status || ''}
            onChange={(e) => setStatus(e.target.value as Appointment["status"])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitakize"
          >
            <option value="">select Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>

        <div className="flex justify-center gap-2 md:gap-4">
          <Button
            type="submit"
            disabled={loading}
            className={` py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gray-600 hover:bg-gray-700'
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
              'Update Appointment'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentUpdateForm;