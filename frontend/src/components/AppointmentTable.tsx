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
import { Trash2, Calendar, Search, Filter, CircleChevronLeft, Edit } from "lucide-react";
import type { Appointment } from '../types';
import { Label } from "./ui/label";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>("all");

  const totalAppointments = appointments.length;

  const statusOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.status))], [appointments]);
  const typeOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.type))], [appointments]);
  const platformOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.platform))], [appointments]);
  const categoryOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.category || ''))], [appointments]);
  const subCategoryOptions = useMemo(() => ["all", ...new Set(appointments.map(apt => apt.sub_category || ''))], [appointments]);

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

      const matchesCategory =
        categoryFilter === "all" || apt.category === categoryFilter;

      const matchesSubCategory =
        subCategoryFilter === "all" || apt.sub_category === subCategoryFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPlatform && matchesCategory && matchesSubCategory;
    });
  }, [appointments, searchTerm, statusFilter, typeFilter, platformFilter, categoryFilter, subCategoryFilter]);


  // console.error(filteredAppointments);
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm mt-6">
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-lg md:text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 md:gap-5">
          <Calendar className="h-5 w-5" />
          Appointments for {formattedDisplayDate}
          <Badge variant="secondary" className="ml-2 text-2xl md:text-md font-bold md:font-semibold hidden md:inline-flex">
            {totalAppointments} appointment{totalAppointments !== 1 ? "s" : ""}
          </Badge>
        </h3>
      </div>

      {/* Filters & Search */}
      <div className="p-6 pt-0">
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                  
          <div className="flex flex-col items-center gap-2 w-full md:w-auto">
            <Badge variant="secondary" className="ml-2 text-2xl md:text-md font-bold md:font-semibold inline-flex md:hidden capitalize">
              {totalAppointments} appointment{totalAppointments !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Search */}
          <div className="flex flex-col items-center gap-2 w-full md:w-auto">
            <Label>Search</Label>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="h-4 w-4 font-bold" />
              <Input
                type="text"
                placeholder="Search by client name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 pr-5"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col items-center gap-2">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 font-bold hidden md:inline-flex" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
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
                  {typeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
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
                  {platformOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Category Filter */}
          <div className="flex flex-col items-center gap-2">
            <Label>Category</Label>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === '' ? 'No category' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sub-Category Filter */}
          <div className="flex flex-col items-center gap-2">
            <Label>Sub-Category</Label>
            <div className="flex items-center gap-2">
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Sub-Categories" />
                </SelectTrigger>
                <SelectContent>
                  {subCategoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === '' ? 'No sub-category' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* TABLE — Visible on medium and larger screens */}
        <div className="overflow-x-auto hidden md:block">
          <Table>
            <TableCaption>A list of appointments for {formattedDisplayDate}.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>category</TableHead>
                <TableHead>sub_category</TableHead>
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
                    <TableCell className="font-medium">{apt.client.name || '--'}</TableCell>
                    <TableCell>{apt.client.age}</TableCell>
                    <TableCell>
                      {customFormatTime(apt.start)} - {customFormatTime(apt.end)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors
                          ${apt.type === "consultation"
                            ? "border-green-500 text-green-700"
                            : apt.type === "maintenance"
                            ? "border-red-500 text-red-700"
                            : apt.type === "treatment"
                            ? "border-blue-500 text-blue-700"
                            : ""}`}
                      >
                        {apt.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {apt.category || "—" }
                    </TableCell>
                    <TableCell className="capitalize">
                      {apt.sub_category || "—" }
                    </TableCell>
                    <TableCell className="capitalize">
                      {apt.platform.replace("-", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize inline-flex items-center text-white rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors
                          ${apt.status === "completed"
                            ? "bg-green-700"
                            : apt.status === "cancelled"
                            ? "bg-red-700"
                            : apt.status === "rescheduled"
                            ? "bg-black"
                            : apt.status === "scheduled"
                            ? "bg-blue-700"
                            : ""}`}
                      >
                        {apt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={apt.notes}>
                      {apt.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* <AppointmentUpdateFormPopup appointmentId={apt._id} /> */}
                        <Button 
                        variant="ghost"
                        onClick={()=> navigate(`/update/appointment/${apt._id}`)}>
                          <Edit className="h-4 w-4"/>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => onDeleteAppointment(apt._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center font-bold">
                    No appointments found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* CARDS — Visible only on small/mobile screens */}
        <div className="space-y-4 block md:hidden">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((apt) => (
              <Card key={apt._id} className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl font-bold capitalize">{apt.client.name}</CardTitle>
                    <Badge
                      className={`capitalize text-white rounded-full px-2 py-0.5 text-xs font-semibold
                        ${apt.status === "completed"
                          ? "bg-green-700"
                          : apt.status === "cancelled"
                          ? "bg-red-700"
                          : apt.status === "rescheduled"
                          ? "bg-black"
                          : apt.status === "scheduled"
                          ? "bg-blue-700"
                          : ""}`}
                    >
                      {apt.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-md font-bold">
                    {customFormatTime(apt.start)} - {customFormatTime(apt.end)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-lg font-bold">Age</span>
                      <p className="text-lg text-gray-600">{apt.client.age}</p>
                    </div>
                    <div>
                      <span className="text-lg font-bold">Type</span>
                      <Badge
                        variant="outline"
                        className={`capitalize w-fit text-xs py-0.5 mx-2 sm:mx-4 px-2
                          ${apt.type === "consultation"
                            ? "border-green-500 text-green-700"
                            : apt.type === "maintenance"
                            ? "border-red-500 text-red-700"
                            : apt.type === "treatment"
                            ? "border-blue-500 text-blue-700"
                            : ""}`}
                      >
                        {apt.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-lg font-bold">Category</span>
                      <p className="text-lg text-gray-600 capitalize">{apt.category}</p>
                    </div>
                    <div>
                      <span className="text-lg font-bold">Sub_category</span>
                      <p className="text-lg text-gray-600 capitalize">{apt.sub_category}</p>
                    </div>
                    <div>
                      <span className="text-lg font-bold">Platform</span>
                      <p className="text-lg text-gray-600 capitalize">{apt.platform.replace("-", " ")}</p>
                    </div>
                    <div>
                      <span className="text-lg font-bold">Notes</span>
                      <p className="truncate text-md text-gray-600" title={apt.notes}>
                        {apt.notes || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 justify-center items-center">
                    <Button 
                    variant="ghost"
                    className="w-6/12 ring"
                    onClick={()=> navigate(`/update/appointment/${apt._id}`)}>
                      <Edit className="h-4 w-4"/>
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-destructive w-6/12 ring"
                      onClick={() => onDeleteAppointment(apt._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center font-bold py-8">
              No appointments found matching your criteria.
            </p>
          )}
        </div>

        {/* Back Button (responsive-friendly) */}
        <div className="mt-6 flex gap-3 items-center justify-center">
          <Button variant={"outline"} className="px-4 py-2 text-sm font-medium rounded transition">
            <Link to="/" className="flex gap-1 md:gap-2 items-center">
              <CircleChevronLeft className="h-4 w-4" />
              <span>Calendar</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;
