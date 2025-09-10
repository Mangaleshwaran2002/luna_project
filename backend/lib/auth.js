// backend/lib/auth.js
import { betterAuth } from "better-auth";
import { admin,username } from "better-auth/plugins"
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";


import dotenv from 'dotenv'; // Import dotenv

dotenv.config();

const client = new MongoClient( process.env.MONGO_URI || 'mongodb://localhost:27017/appointmentDB');
const db = client.db();
export const auth = betterAuth({
    // database: new Database("./sqlite.db"),
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true, 
    }, 
    user: {
        additionalFields: {
            name: {
                type: 'string',
                required: false, // This makes the name field optional
            }
        },
        deleteUser: { 
            enabled: true
        }
    },
    trustedOrigins: [process.env.APP_URL || 'http://localhost:5173'],
    plugins: [
        admin(),
        username(),
    ],
    logger: {
		level: "debug",
		log: (level, message, ...args) => {
			// Custom logging implementation
			console.log(`[${level}] ${message} -- ${new Date().toISOString()}`, ...args);
		}
	},
})


