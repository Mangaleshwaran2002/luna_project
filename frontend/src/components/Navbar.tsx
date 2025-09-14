import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/Auth';

// Import Lucide icons
import { Calendar, LogIn,UserRoundCog, RefreshCcw, LogOut, Users, User } from 'lucide-react';
import { Button } from './ui/button';
import logo from '../assets/logo.svg'
// Define the NavLink interface
interface NavLink {
  path: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Type for Lucide icons
}

const Navbar: React.FC = () => {
  const { user,logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Start with an empty array
  const navLinks: NavLink[] = [];

  // Conditionally add links with Lucide icons
  if (user) {
    navLinks.push(
      { path: '/', label: 'Home', icon: Calendar },
      { path: '/profile', label: 'Profile', icon: User },
      { path: '/reschedule', label: 'Reschedule', icon: RefreshCcw }
    );
    if(user.role === 'admin'){
      navLinks.push(
      { path: '/admin', label: 'Admin', icon: UserRoundCog },
      { path: '/clients', label: 'Clients', icon: Users },
    );
    }
  } else {
    navLinks.push({
      path: '/login',
      label: 'Login',
      icon: LogIn,
    });
  }

  return (
    <nav className="bg-white p-4 text-black shadow-sm mb-2">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/">
          <div className='space-x-2 flex'>
            <img src={logo} alt="logo" width={50} height={40} /> 
            {/* <img src="./logo.svg" alt="logo" width={50} height={40} /> */}
            <span>Luna Skin</span>
            <span className='hidden md:inline-flex'>Aesthetics</span>
          </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex">
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <li key={index} className='flex'>
                <Link to={link.path} className='flex items-center text-black hover:bg-gray-700 hover:text-white transition-all duration-200 mx-3 px-3 py-2 rounded-lg '>
                <Icon width={15} height={15} className="mr-1" />
                  {link.label}
                </Link>
              </li>
            );
          })}
          {user && (
          <>
          <Button variant={'ghost'} className='flex items-center text-black hover:bg-gray-700 hover:text-white transition-all duration-200' onClick={logout}>
            <LogOut /> <span>logout</span>
            </Button>
          </>
          )}
        </ul>
        

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="focus:outline-none focus:ring-2 focus:ring-gray-700 p-1 rounded"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white mt-2 rounded-md shadow-lg">
          <ul className="flex flex-col gap-1 px-2 py-3">
            {navLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="flex items-center p-2.5 text-black hover:bg-gray-700 hover:text-white rounded transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon width={10} height={10} className="mr-2" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          <li>
          {user && (
          <>
          <Button variant={'ghost'} className='flex justify-start w-full  p-2.5 text-black hover:bg-gray-700 hover:text-white rounded transition-colors' onClick={logout}>
            <LogOut /> <span>logout</span>
            </Button>
          </>
          )}
            
          </li>

          </ul>
        </div>
      )}

    </nav>
  );
};

export default Navbar;