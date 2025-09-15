import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of the context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Custom hook for easy consumption
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Provider component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      autoConnect: true, // We'll manually connect
    });

    // Event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    // Manually connect
    newSocket.connect();

    // Set socket in state
    setSocket(newSocket);

    // Cleanup function: disconnect socket on unmount or before window close
    const cleanup = () => {
      if (newSocket) {
        newSocket.disconnect();
        console.log('Socket disconnected on cleanup');
      }
    };

    // Handle window close/reload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log(e)
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Return cleanup function for component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, []); // Run only once on mount

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};