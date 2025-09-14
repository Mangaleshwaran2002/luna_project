import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";


const Layout = () => (
  
    <div className="flex flex-col min-h-screen transition-all duration-500 ease-in-out">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
);
export default Layout;