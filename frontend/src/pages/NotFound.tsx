import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
    <h1 className="text-9xl font-extrabold tracking-widest">
      404
    </h1>
    <div className="bg-purple-600 px-2 text-sm rounded rotate-12 absolute">
      Page Not Found
    </div>
    <p className="mt-5 text-gray-400">
      The page you tried to access doesn't exist.
    </p>
    <Link to="/" className="mt-6 inline-block px-8 py-3 text-sm font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors">
      Go back to Home
    </Link>
  </div>
);

export default NotFound;
