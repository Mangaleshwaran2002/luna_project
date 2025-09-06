import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import CreateUserForm from "./CreateUserForm";

export default function UserCreationFormPopup(){
    return (
        <>
        <AlertDialog >
        <AlertDialogTrigger className="my-2 border-2 px-4 py-2 rounded-md">New</AlertDialogTrigger>
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