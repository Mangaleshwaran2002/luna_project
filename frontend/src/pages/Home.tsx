import Calendar from "@/components/Calendar";
import { authClient } from "../lib/auth-client";


// import AppoitmentTable from "@/components/AppointmentTable";

const Home = () => {
  const fetchUserSession = async () => {
            try {
                const { data, error: authError } = await authClient.getSession();

                if (authError) {
                    console.error("Session error:", authError);
                } else if (data) {
                    console.log( data );
                    // Store the entire data object
                }
            } catch (e: any) {
                console.error("Unexpected error:", e);
            } 
        };
  fetchUserSession();
  return (
    <div>
      <Calendar/>
    </div>
  );
};
export default Home;