import React, { useState } from 'react';
import type { AppointmentData } from '../types';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon,ArrowLeft  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios_config';

const AppointmentForm: React.FC = () => {
  const navigate = useNavigate();
  // Client and metadata fields
  const [formData, setFormData] = useState<Omit<AppointmentData, 'start' | 'end'>>({
    client: {
      name: '',
      age: '',
      gender: 'female',
      contact: '+91',
      address: '',
    },
    platform: 'website',
    type: 'consultation',
    status: 'scheduled',
    notes: '',
  });

  // Separate date and time state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>('10:00:00');

  // const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<string>('11:00:00');

  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Handle client input changes
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [name]: value,
      },
    }));
  };

  // Handle top-level fields (platform, type, notes)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Combine date and time into ISO string
  const combineDateTime = (date: Date | undefined, time: string): string | '' => {
    if (!date || !time) return '';
    console.log(`time.split : ${time.split(':')}`)
    const [hours, minutes, seconds] = time.split(':');
    const combined = new Date(date);
    combined.setHours(Number(hours), Number(minutes), Number(seconds || 0), 0);
    return combined.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Combine date + time into ISO strings
    const start = combineDateTime(startDate, startTime);
    const end = combineDateTime(startDate, endTime);

    if (!start || !end) {
      setResponseMessage('Please select both start and end date & time.');
      return;
    }

    // Final payload to send
    const payload: AppointmentData = {
      ...formData,
      start,
      end,
    };
    console.debug(payload);
    try {
      const response = await axios.post('http://localhost:5000/api/appointments', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;
      setResponseMessage('Appointment created successfully!');
      navigate('/')
      console.log('Success:', result);

    } catch (error) {
      setResponseMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-4 sm:space-y-8 my-2 sm:my-4">
      <Button className='px-2 sm:px-5' onClick={()=> navigate('/')}>
        <ArrowLeft />back
      </Button>
      <h2 className="text-2xl font-bold text-gray-800 text-center">Book a New Appointment</h2>

      {/* Client Information */}
      <fieldset className="border border-gray-300 rounded-md p-6 space-y-4">
        <legend className="text-lg font-semibold text-gray-700 px-2">Client Information</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="client-name">Name</Label>
            <Input
              id="client-name"
              name="name"
              value={formData.client.name}
              onChange={handleClientChange}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="client-age">Age</Label>
            <Input
              id="client-age"
              name="age"
              type="number"
              value={formData.client.age}
              onChange={handleClientChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-gender">Gender</Label>
            <select
              id="client-gender"
              name="gender"
              value={formData.client.gender}
              onChange={handleClientChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="client-contact">Contact</Label>
            <Input
              id="client-contact"
              name="contact"
              type="tel"
              value={formData.client.contact}
              onChange={handleClientChange}
              required
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="client-address">Address</Label>
            <Input
              id="client-address"
              name="address"
              value={formData.client.address}
              onChange={handleClientChange}
            />
          </div>
        </div>
      </fieldset>

      {/* Appointment Details */}
      <fieldset className="border border-gray-300 rounded-md p-6 space-y-6">
        <legend className="text-lg font-semibold text-gray-700 px-2">Appointment Details</legend>
        <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between font-normal">
                    {startDate ? startDate.toLocaleDateString('en-GB') : 'Select date'}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">

          {/* Start Time */}
          <div className="space-y-4">
            {/* Start Time */}
            <div className="flex flex-col gap-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => {
                  console.log(e.target.value)
                  setStartTime(e.target.value)
                }}
                className="bg-background [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
          {/* End Time */}
          <div className="space-y-4">
            {/* End Time */}
            <div className="flex flex-col gap-2">
              <Label>End Time</Label>
              <Input
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-background [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
        </div>

        {/* Platform */}
        <div className="space-y-1">
          <Label htmlFor="platform">Platform</Label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="website">Website</option>
            <option value="phone">Phone</option>
            <option value="in-person">In-Person</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        {/* Type */}
        <div className="space-y-1">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="consultation">Consultation</option>
            <option value="treatment">Treatment</option>
            <option value="follow-up">Follow-Up</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className="flex flex-col items-center">
        <Button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white">
          Submit Appointment
        </Button>

        {responseMessage && (
          <p
            className={
              responseMessage.startsWith('Error')
                ? 'mt-4 text-sm text-red-600 font-medium'
                : 'mt-4 text-sm text-green-600 font-medium'
            }
          >
            {responseMessage}
          </p>
        )}
      </div>
    </form>
  );
};

export default AppointmentForm;