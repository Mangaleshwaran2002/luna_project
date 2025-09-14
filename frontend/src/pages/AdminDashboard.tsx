import AccountsTable from "@/components/AccountsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import CreateUserForm from "@/components/CreateUserForm";
// import UserCreationFormPopup from "@/components/UserCreationFormPopup";

export default function AdminDashboard(){
    const navigate = useNavigate()
    return (
        <>
        <div className="flex items-center flex-col md:p-5">
        <div className="w-full md:w-10/12 flex justify-end">
            <Button variant={"secondary"} className="mx-4 my-2 md:my-4 capitalize ring" onClick={()=>navigate('/create/user')}><Plus/>Add</Button>
        </div>
        <AccountsTable/>
        </div>

        </>
    );
}