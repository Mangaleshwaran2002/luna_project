import {  useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AppointmentTable from "@/components/AppointmentTable";
import type { Appointment, ApiAppointment} from '../types';
import axios from "../utils/axios_config";
import { useSocket } from '../context/SocketContext';

const AppointmentsByDatePage = () => {
  const { date } = useParams<{ date: string }>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();
  useEffect(() => {
    if (!date) {
      setIsLoading(false);
      setError("Invalid date provided.");
      return;
    }
    // Ensure socket is connected and not null before emitting
    if (!socket) {
      setError("Socket not available.");
      setIsLoading(false);
      return;
    }
  // Listen for new/deleted appointments
  const handleCreated = (newAppointment: Appointment) => {
    const formatted: Appointment = {
      _id: newAppointment._id,
      client: newAppointment.client,
      appointmentDate: new Date(newAppointment.start).toISOString().split('T')[0],
      start: newAppointment.start,
      end: newAppointment.end,
      platform: newAppointment.platform,
      type: newAppointment.type,
      status: newAppointment.status,
      notes: newAppointment.notes,
      createdAt: newAppointment.createdAt,
      updatedAt: newAppointment.updatedAt,
    };
    setAppointments(prev => [...prev, formatted]);
  };
  if(isConnected){
      // Join the room for this date
  socket.emit('join-appointments-date', date);


  socket.on('appointment:deleted', (data: { _id: string }) => {
    console.log('Appointment deleted:', data._id);
    setAppointments(prev => prev.filter(apt => apt._id !== data._id));
  });
  socket.on('appointment:created', handleCreated);
  
  }
  
  const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {

        const response = await axios.get(`/api/appointments/filter-by-date`, {
          params: { date }
        });

        const resdata = response.data;
        const result: ApiAppointment[] = resdata.data;
        const formattedAppointments: Appointment[] = result.map(apt => ({
          _id: apt._id,
          client: apt.client,
          appointmentDate: new Date(apt.appointmentDate).toISOString().split('T')[0],
          start: apt.start,
          end: apt.end,
          platform: apt.platform,
          type: apt.type,
          status: apt.status,
          notes: apt.notes,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt,
        }));
        setAppointments(formattedAppointments);
      } catch (e: any) {
        console.error("Failed to fetch appointments:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
    return () => {
    socket.off('appointment:created', handleCreated);
    socket.off('appointment:deleted');
  };
  }, [date]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading appointments...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!date) {
    return <div className="p-6 text-red-500">Invalid date.</div>;
  }
  
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  // Define the delete function in the parent component
  const deleteAppointment = async (id: string) => {
      try {
        const response = await axios.delete(`/api/appointments/${id}`);
        if(response.status === 200 ) {
          console.log('record deleted successfully.');
          // Update the state to remove the appointment
          setAppointments(prevAppointments => prevAppointments.filter(apt => apt._id !== id));
        }
      } catch (e: any) {
        console.error("Failed to delete appointment:", e);
      } 
  };

  return (
    <div className="p-6">
      {appointments.length > 0 ? (
        <AppointmentTable 
          appointments={appointments} 
          formattedDisplayDate={formattedDate}
          onDeleteAppointment={deleteAppointment} // Pass the function as a prop
        />
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-lg border">
          <p className="text-gray-500">No appointments scheduled for {formattedDate}.</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentsByDatePage;
