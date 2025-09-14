import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import DateCell from "./DateCell";
import { useNavigate } from "react-router-dom";
import type { Appointment, ApiAppointment } from '../types';
import axios from "../utils/axios_config";
import { useSocket } from '../context/SocketContext';


// Month and Year Lists
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

// Main Calendar Component
const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();
  if (!socket) {
        return;
  }

  const handleCreated = (newAppointment: Appointment) => {
      // ✅ Trust the server — DO NOT recalculate appointmentDate
      console.debug(`\n\n${newAppointment} \n\n`)
      // setAppointments(prev => [...prev, newAppointment]);
      // window.location.reload();
  };
  const handledeleted = () => {
      // ✅ Trust the server — DO NOT recalculate appointmentDate
      // setAppointments(prev => [...prev, newAppointment]);
      window.location.reload();
  };
  socket.on('appointment:created', handleCreated);
  socket.on('appointment:deleted', handledeleted);
  useEffect(() => {

    const fetchAppointments = async () => {
      setIsLoading(true);
      setError(null);
      try {

        const response = await axios.get(`/api/appointments/filter`, {
        params: {
          month: currentMonth + 1,
          year: currentYear
        }
      });
      const result:{ data: ApiAppointment[] } = response.data;

        // Map the raw API data to the Appointment interface
        const formattedAppointments: Appointment[] = result.data.map(apt => ({
          _id: apt._id,
          client: apt.client,
          appointmentDate: new Date(apt.appointmentDate).toISOString().split('T')[0], // Extract only the date part
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
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
    return () => {
      setAppointments([]);
  };
  }, [currentMonth, currentYear]);
  // Navigate month
  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentMonth((prev) => {
        if (prev === 0) {
          setCurrentYear((y) => y - 1);
          return 11;
        }
        return prev - 1;
      });
    } else {
      setCurrentMonth((prev) => {
        if (prev === 11) {
          setCurrentYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      });
    }
  };

  // Group appointments by date (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, apt) => {
      acc[apt.appointmentDate] = acc[apt.appointmentDate] || [];
      acc[apt.appointmentDate].push(apt);
      return acc;
    }, {});
  }, [appointments]);

// Handle date click
  const handleDateClick = (dateKey: string) => {
    console.log(`\n\n\nspecific date clicked ${dateKey}\n\n`)

    navigate(`/appointments/${dateKey}`);

  };

  // Generate calendar grid
  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    const days = [];
    const currentDate = new Date(startDate);
    while (days.length < 42) {
      const day = currentDate.getDate();
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const isCurrentMonth = month === currentMonth;
      const dailyAppointments = appointmentsByDate[dateKey] || [];

      days.push(
        <DateCell
          key={dateKey}
          day={day}
          isToday={dateKey === todayKey}
          appointments={dailyAppointments}
          isCurrentMonth={isCurrentMonth}
          onClick={() => handleDateClick(dateKey)}
        />
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="md:h-screen flex flex-col bg-background">
        {/* Header */}
        <div className="flex flex-row sm:flex-row items-start sm:items-center justify-between p-4 border-b mb-1 bg-card gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-6/12 sm:w-auto">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="shrink-0 hidden md:flex"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Select
                  value={currentMonth.toString()}
                  onValueChange={(value) => setCurrentMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {months[index]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currentYear.toString()}
                  onValueChange={(value) => setCurrentYear(parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-[100px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="shrink-0 hidden md:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            // variant="outline"
            className="hidden md:flex items-center gap-2 sm:w-auto shrink-0 w-6/12"
            size="sm"
            onClick={() => navigate('/appointments/new')}
          >
            <Plus className="h-4 w-4" /> Add Appointment
          </Button>
        </div>
        {/* Weekday headers */}
        <div className="mx-auto">
          <div className="grid grid-cols-7 text-center font-semibold text-muted-foreground border-b bg-secondary">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 sm:p-5 w-13 md:w-auto">{day}</div>
          ))}
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 md:grid-rows-6 md:auto-rows-fr space-x-1">
          {renderCalendar()}
        </div>
        <div className="flex md:hidden items-center justify-center my-3">
          <Button
            // variant="outline"
            className="flex md:hidden items-center gap-2 sm:w-auto shrink-0 w-6/12"
            size="sm"
            onClick={() => navigate('/appointments/new')}
          >
            <Plus className="h-4 w-4" /> Add Appointment
        </Button>
        </div>

        </div>
        <div className="hidden md:flex justify-center items-center space-x-2 md:space-x-6 flex-col md:flex-row">
          {/* Non-rescheduled consultation count */}
          <div className="flex justify-center items-center">
          <span className="flex items-center justify-center w-3 h-3 text-xs text-white bg-blue-300 rounded-full">
          </span>
          <span className="mx-2 capitalize text-xs md:text-sm">consultations</span>
          </div>
          <div className="flex justify-center items-center">
          <span className="flex items-center justify-center w-3 h-3 text-xs text-white bg-green-300 rounded-full">
          </span>
          <span className="mx-2 capitalize text-xs md:text-sm">treatments</span>
          </div>
          <div className="flex justify-center items-center">
          <span className="flex items-center justify-center w-3 h-3 text-xs text-white bg-red-300 rounded-full">
          </span>
          <span className="mx-2 capitalize text-xs md:text-sm">follow_up</span>
          </div>
          <div className="flex justify-center items-center">
          <span className="flex items-center justify-center w-3 h-3 text-xs text-white bg-teal-300 rounded-full">
          </span>
          <span className="mx-2 capitalize text-xs md:text-sm">maintenance</span>
          </div>
          <div className="flex justify-center items-center">
          <span className="flex items-center justify-center w-3 h-3 text-xs text-white bg-orange-500 rounded-full">
          </span>
          <span className="mx-2 capitalize text-xs md:text-sm">rescheduled</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendar;
