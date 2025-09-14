import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import type { Appointment } from "@/types";

const NotifyMe = () => {
    const { socket } = useSocket();
    const seenAppointments = useRef<Set<string>>(new Set());

    // Cleanup old IDs to prevent memory leak
    useEffect(() => {
        const interval = setInterval(() => {
            seenAppointments.current.clear();
            console.log('Cleared seen appointment IDs');
        }, 5 * 60 * 1000); // Every 5 minutes

        return () => clearInterval(interval);
    }, []);

    const handleCreated = useCallback((newAppointment: Appointment) => {
        // Deduplicate by ID
        if (seenAppointments.current.has(newAppointment._id)) {
            console.log(`Duplicate notification ignored for ID: ${newAppointment._id}`);
            return;
        }
        seenAppointments.current.add(newAppointment._id);

        const isoString = newAppointment.start;
        const date = new Date(isoString);
        console.log(`New appointment created at ${date.toLocaleString()}`);

        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications");
            return;
        }

        if (Notification.permission === "granted") {
            const notification = new Notification(`New Appointment 🗓️`, {
                body: `Scheduled: ${date.toLocaleString('en-GB')}`,
                tag: `appt-${newAppointment._id}`, // Helps browser dedupe
                icon: "/logo.ico", // Optional: add an icon
                requireInteraction: false, // ← Allows auto-dismiss in Chrome!
            });

            // 💥 CRITICAL FOR CHROME: Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            console.log(`Notification shown for:`, newAppointment._id);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    const notification = new Notification(`New Appointment 🗓️`, {
                        body: `Scheduled: ${date.toLocaleString()}`,
                        tag: `appt-${newAppointment._id}`,
                        icon: "/logo.ico",
                        requireInteraction: false,
                    });

                    setTimeout(() => {
                        notification.close();
                    }, 5000);

                    console.log(`Notification shown after permission granted.`);
                } else {
                    console.log("User denied notification permission.");
                }
            }).catch((error) => {
                console.error("Error requesting notification permission:", error);
            });
        }
        window.location.reload();
        console.table(newAppointment);
        // setTimeout(() => {
        // window.location.reload();
        // }, 5000);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('appointment:created', handleCreated);

        return () => {
            socket.off('appointment:created', handleCreated);
        };
    }, [socket, handleCreated]);

    return null;
};

export default NotifyMe;