import AccountsTable from "@/components/AccountsTable";
// import CreateUserForm from "@/components/CreateUserForm";
import UserCreationFormPopup from "@/components/UserCreationFormPopup";

export default function AdminDashboard(){
    return (
        <>
        <div className="flex items-center flex-col md:p-5">
        <div className="md:w-10/12 w-full flex justify-end">
            <UserCreationFormPopup/>
        </div>
        
        <AccountsTable/>
        </div>

        </>
    );
}