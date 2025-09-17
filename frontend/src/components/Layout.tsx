import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";


const Layout = () => (
  
    <div className="flex flex-col min-h-screen transition-all duration-500 ease-in-out">
      <Navbar />
      <main className="flex-1 mb-15 md:mb-5">
        <Outlet />
      </main>
      <Footer/>
    </div>
);
export default Layout;