import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import CreateUserForm from "./CreateUserForm";
import { UserPlus } from "lucide-react";

export default function UserCreationFormPopup(){
    return (
        <>
        <AlertDialog >
        <AlertDialogTrigger className="my-4 md:my-2 mx-5 md:mx-2 border-2 px-4 py-2 rounded-md flex items-center gap-2"><UserPlus height={15} width={15} /><span>Create</span></AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Create new User</AlertDialogTitle>
            <AlertDialogDescription>
                <CreateUserForm />
            </AlertDialogDescription>
            </AlertDialogHeader>
        </AlertDialogContent>
        </AlertDialog>
        </>
    );
}