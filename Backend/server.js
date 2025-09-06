import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';

// --- ES Module Fixes for __dirname and __filename ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Use CORS middleware, allowing requests from your frontend origin


// Create the 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created uploads directory');
    }
} catch (error) {
    console.error('Error creating uploads directory:', error);
    process.exit(1);
}

// Initialize Express
const app = express();

app.use(cors({
    origin: [process.env.APP_URL || 'http://localhost:5173','http://localhost','http://localhost:80'],
    credentials: true,
}));

// Mount the Better Auth handler for all /api/auth requests.
app.all('/api/auth/{*any}', toNodeHandler(auth));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Port
const PORT = process.env.PORT || 5000;
console.log("Allowed origin:", process.env.APP_URL || 'http://localhost:5173');



// Create HTTP server and attach socket.io
const httpServer = createServer(app); // ← Create server from Express app
const io = new Server(httpServer, {
    cors: {
        origin: [process.env.APP_URL || 'http://localhost:5173','http://localhost','http://localhost:80'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Store io instance so controllers can access it
global.io = io;


// Routes - Change to dynamic import()
// This is necessary because CJS-style require() does not work in ESM for local files.
async function registerRoutes() {
    const AppointmentRoutes = await import('./routes/AppointmentRoutes.js');
    const RescheduleRoutes = await import('./routes/RescheduleRoutes.js');
    // const { requireAuth } = await import('./middlewares/auth_middleware.js'); 

    app.use('/api/appointments',  AppointmentRoutes.default);
    app.use('/api/reschedule',  RescheduleRoutes.default);
}
registerRoutes();

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
});

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Appointment API is running' });
});
// ✅ ADD HEALTH CHECK ROUTE
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Profile route
app.get('/profile', async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session) {
        res.json({ message: 'You are authenticated!', user: session.user });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Create-admin route
app.get('/create-admin', async (req, res) => {
    try{
    const newUser = await auth.api.createUser({
        body: {
            email: 'admin@example.com',
            password: 'superuser',
            name: 'James Smith',
            role: 'admin',
            data: {
                username: 'admin',
                displayUsername: 'superuser'
            },
        },
    });
    if (newUser) {
        res.json({ message: 'admin account created', user: newUser });
    } else {
        res.status(401).send('Unauthorized');
    }
    }catch(err){
        res.status(500).json({ message: 'error while creating admin.', error: err });
    }
    
});



// Middleware: Join room based on date
io.on('connection', (socket) => {
    console.log('\n\n\nClient connected:', socket.id, '\n\n\n');

    socket.on('join-appointments-month', (monthYear) => {
        if (monthYear) {
            socket.join(`appointments:${monthYear}`);
            console.log(`\n\n\nClient ${socket.id} joined monthly room: appointments:${monthYear}\n\n\n`);
        }
    });

    socket.on('join-appointments-date', (date) => {
        if (date) {
            socket.join(`appointments:${date}`);
            console.log(`\n\n\nClient ${socket.id} joined daily room: appointments:${date}\n\n\n`);
        }
    });

    socket.on('disconnect', () => {
        console.log('\n\n\nClient disconnected:', socket.id, '\n\nn\n');
    });
});

// Replace app.listen with httpServer.listen
httpServer.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});

// Export app and upload using ES module syntax
export { app, upload };
