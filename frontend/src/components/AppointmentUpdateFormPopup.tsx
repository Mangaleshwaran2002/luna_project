import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import AppointmentUpdateForm from "./AppointmentUpdateForm";
import { Edit } from "lucide-react";

// Define component props
interface AppointmentUpdateProps {
  appointmentId?: string;
}

export default function AppointmentUpdateFormPopup({ appointmentId }: AppointmentUpdateProps) {
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger>
          <Edit className="h-4 w-4"/>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              <AppointmentUpdateForm appointmentId={appointmentId} />
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}