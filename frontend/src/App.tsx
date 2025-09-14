import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, RequireAuth } from "./context/Auth";
import Layout from "./components/Layout";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import NotFoundPage from "./pages/NotFound";
import AppointmentsByDatePage from "./pages/AppointmentsByDatePage";
import RescheduleRecordsTable from "./pages/ReschedulePage";
import AppointmentFormPage from "./pages/AppointmentFormPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePasswd from "./pages/ChangePasswdPage";
import Profile from "./pages/Profile";
import CreateUserPage from "./pages/CreateUserPage";
import UpdateAppointmentPage from "./pages/UpdateAppointmentPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import ClientUpdateForm from "./components/ClientUpdateForm";


const App = () => {
  console.log(`VITE_API_URL : ${import.meta.env.VITE_API_URL}`)
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/reschedule" element={<RescheduleRecordsTable />} />
              <Route path="/appointments/new" element={<AppointmentFormPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/changepasswd" element={<ChangePasswd />} />
              <Route path="/create/user" element={<CreateUserPage/>} />
              <Route path="/update/appointment/:id" element={<UpdateAppointmentPage/>} />
              <Route path="/clients" element={<ClientDetailsPage/>} />
              <Route path="/clients/update/:id" element={<ClientUpdateForm/>} /> 
              


              {/* New Route */}
              <Route path="/profile" element={<Profile />} />

            <Route path="/appointments/:date" element={<AppointmentsByDatePage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;