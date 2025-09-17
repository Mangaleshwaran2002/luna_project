const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-600 text-white py-2 shadow-lg z-10">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} <strong>Zenotra</strong>. Appointment Manager for 
            <span className="space-x-1 mx-1">
                <span className="font-bold">Luna Skin</span>
                <span className='hidden md:inline-flex font-bold'>Aesthetics</span>.
                </span>
            </p>
        <p className="mt-1">Developed by <span className="font-bold">Mangaleshwaran Dev</span></p>
      </div>
    </footer>
  );
};

export default Footer;

