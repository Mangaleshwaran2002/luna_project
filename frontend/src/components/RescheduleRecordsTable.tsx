// RescheduleRecordsTable.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import type { RescheduleRecord } from '../types';
import { Button } from "./ui/button";
import { Trash2, Search, Filter } from "lucide-react";
import axios from '../utils/axios_config'
import { useAuth } from "@/context/Auth";

const customFormatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const customFormatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB');
};

const RescheduleRecordsTable: React.FC = () => {
  const [records, setRecords] = useState<RescheduleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin,setIsAdmin] =useState<boolean | null>(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleByFilter, setScheduleByFilter] = useState<string>("all");
  const { user } = useAuth();
  // Fetch data from the backend API
  useEffect(() => {
    const fetchRecords = async () => {
      if(user?.role === 'admin'){
        setIsAdmin(true);
      }
      try {
        setLoading(true); // Set loading to true before fetching
        const response = await axios.get("/api/reschedule/");
        
        const data = response.data; // Axios automatically parses JSON into `data` property
        
        // Assuming the API returns a { success, count, data } object
        if (data.success) {
        
          setRecords(data.data as RescheduleRecord[]);
        } else {
          setError("Failed to fetch records from API");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchRecords();
  }, []); // The empty dependency array ensures this runs only once on mount
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/reschedule/${id}`);
      
      if(response.status === 200){
        console.log('record deleted successfully')
      }
      setRecords(records.filter((record) => record._id !== id));
    } catch (err: any) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record. Please try again.");
    }
  };
  const totalRecords = records.length;

  const scheduleByOptions = useMemo(() => ["all", ...new Set(records.map(rec => rec.scheduleBy))], [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.scheduleBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesScheduleBy =
        scheduleByFilter === "all" || record.scheduleBy === scheduleByFilter;

      return matchesSearch && matchesScheduleBy;
    });
  }, [records, searchTerm, scheduleByFilter]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-8 md:mx-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-wrap gap-4 mb-6 p-4  rounded-lg">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by client name or scheduler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[300px] pl-9"/>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select onValueChange={setScheduleByFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Scheduler" />
              </SelectTrigger>
              <SelectContent>
                {scheduleByOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "all" ? "All Schedulers" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </div>
        </div>
      </div>
      <div className="rounded-md border sm:border-2 p-2 md:p-5 shadow-md">
        <Table className="mx-auto">
          <TableCaption>
            Total Records: {filteredRecords.length} of {totalRecords}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Original Appointment</TableHead>
              <TableHead>Rescheduled Date</TableHead>
              <TableHead>Rescheduled Time</TableHead>
              <TableHead>Scheduled By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.client.name}</TableCell>
                  <TableCell>
                    {customFormatDate(record.preschedule.start)} at {customFormatTime(record.preschedule.start)}
                  </TableCell>
                  <TableCell>{customFormatDate(record.reschedule.start)}</TableCell>
                  <TableCell>{customFormatTime(record.reschedule.start)}</TableCell>
                  <TableCell>{record.scheduleBy}</TableCell>
                  <TableCell>
                    {isAdmin ? (<Button variant="destructive" size="icon" onClick={() => handleDelete(record._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>): (<Button variant="destructive" size="icon" disabled={true}>
                      <Trash2 className="h-4 w-4" />
                    </Button>)
                    }
                    
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RescheduleRecordsTable;
