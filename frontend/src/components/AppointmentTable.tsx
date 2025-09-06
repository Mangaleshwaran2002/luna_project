import React, { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Calendar, Search, Filter, CircleChevronLeft } from "lucide-react";
import type { Appointment } from '../types';
import { Label } from "./ui/label";
import { Link } from "react-router-dom";
import AppointmentUpdateFormPopup from "./AppointmentUpdateFormPopup";

interface AppointmentTableProps {
  appointments: Appointment[];
  formattedDisplayDate: string;
  onDeleteAppointment: (id: string) => Promise<void>;
}

const customFormatTime = (isoString: string): string => {
  const date = new Date(isoString);
  // Use toLocaleTimeString() to get the time formatted for the user's locale and timezone
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const AppointmentTable: React.FC<AppointmentTableProps> = ({ 
  appointments, 
  formattedDisplayDate,
  onDeleteAppointment // Destructure the new prop
 }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const totalAppointments = appointments.length;

  const statusOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.status))], [appointments]);
  const typeOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.type))], [appointments]);
  const platformOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.platform))], [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;

      const matchesType = typeFilter === "all" || apt.type === typeFilter;

      const matchesPlatform =
        platformFilter === "all" || apt.platform === platformFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPlatform;
    });
  }, [appointments, searchTerm, statusFilter, typeFilter, platformFilter]);

  
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-6">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Appointments for {formattedDisplayDate}
          <Badge variant="secondary" className="ml-2">
            {totalAppointments} appointment{totalAppointments !== 1 ? "s" : ""}
          </Badge>
        </h3>
      </div>

      {/* Filters & Search */}
      <div className="p-6 pt-0 ">
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          {/* Search */}
          <div className="flex flex-col items-center gap-2">
            <Label>Search</Label>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground" />
              <Input type="text" placeholder="Search by client name or notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 pr-5"
              />
          </div>
          </div>
          

          {/* Status Filter */}
          <div className="flex flex-col items-center gap-2">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
          

          {/* Type Filter */}
          <div className="flex flex-col items-center gap-2">
            <Label>Type</Label>
            <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
          
          
          {/* Platform Filter */}
          <div className="flex flex-col items-center gap-2">
            <Label>Platform</Label>
            <div className="flex items-center gap-2">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
          
        </div>

        {/* Table using ShadCN */}
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of appointments for {formattedDisplayDate}.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="font-medium">{apt.client.name}</TableCell>
                    <TableCell>{apt.client.age}</TableCell>
                    <TableCell>
                      {customFormatTime(apt.start)} - {customFormatTime(apt.end)}
                    </TableCell>
                    <TableCell>
                      {/* "consultation" | "follow-up" | "treatment";  */}
                      <Badge variant="outline" className={`capitalize inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors 
                      ${apt.type === 'consultation' ? 'border-green-500'
                        : apt.type === 'follow-up' ? 'border-red-500' 
                        : apt.type === 'treatment' ?'border-blue-500':''}`}>
                        {apt.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{apt.platform.replace("-", " ")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`capitalize capitalize inline-flex items-center text-white rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border
                      ${apt.status === 'completed' ? 'bg-green-700'
                        : apt.status === 'cancelled' ? 'bg-red-700' 
                        : apt.status === 'rescheduled' ?'bg-black'
                        : apt.status === 'scheduled' ? ' bg-blue-700':''} `}>
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={apt.notes}>
                      {apt.notes}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <AppointmentUpdateFormPopup appointmentId={apt._id} />
                      {/* Call the parent's function here */}
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDeleteAppointment(apt._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No appointments found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-6 flex gap-3 items-center justify-center">
              <Button variant={'outline'} className="px-4 py-2  text-sm font-medium rounded  transition">
              <Link
                to="/"
                className="flex gap-1 md:gap-2"
              >
                <CircleChevronLeft className="mt-0.5" /><span>Calendar</span>
              </Link>
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;
