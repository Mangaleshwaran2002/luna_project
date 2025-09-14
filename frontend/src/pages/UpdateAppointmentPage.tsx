import AppointmentUpdateForm from "@/components/AppointmentUpdateForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const UpdateAppointmentPage = ()=>{
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
      useEffect(() => {
        if (!id) {
          setIsLoading(false);
          setError("Invalid date provided.");
          return;
        }else{
            setIsLoading(false);
            setAppointmentId(id)
        }
    },[id])

      if (isLoading) {
    return <div className="p-6 text-center">Loading appointments...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!id) {
    return <div className="p-6 text-red-500">Invalid id.</div>;
  }
    return(
        <>
        <AppointmentUpdateForm appointmentId={appointmentId} />
        </>
    )
}

export default UpdateAppointmentPage;