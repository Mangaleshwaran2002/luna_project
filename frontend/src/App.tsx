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


const App = () => {
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