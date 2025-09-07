# 🌿 SkinCare Appointment Manager — MERN + Socket.IO + Docker

> A real-time appointment scheduling & management system for skincare clinics, built with the MERN stack, secured with Better Auth, containerized with Docker, and powered by Socket.IO for live updates.

---

## 🚀 Features

- ✅ **Real-time appointment updates** using Socket.IO (e.g., new bookings, cancellations, status changes)
- 🔐 **Secure authentication & authorization** using [Better Auth](https://better-auth.com/)
- 📱 **Responsive UI** for both clinic staff and clients
- 🗓️ **Calendar-based appointment scheduling**
- 📧 **Email/SMS notifications** (optional plugin-ready)
- 👥 **Role-based access** (Admin, Staff, Client)
- 🐳 **Dockerized** for easy local setup and deployment
- 🔄 **Live dashboard** showing today’s appointments, pending requests, and history
- 📊 **Analytics & Reports** (upcoming feature)

---

## 🧰 Tech Stack

| Layer       | Technology                 |
|-------------|----------------------------|
| **Frontend**  | React.js, Tailwind CSS, Axios, Socket.IO Client |
| **Backend**   | Node.js, Express.js, MongoDB (Mongoose), Socket.IO Server |
| **Auth**      | [Better Auth](https://better-auth.com/) — Modern, secure, extensible auth framework |
| **Database**  | MongoDB (with Docker Compose) |
| **DevOps**    | Docker, Docker Compose |
| **Real-time** | Socket.IO |

---

## 🐳 Getting Started with Docker

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed
- `git` installed
- Port `3000` (frontend) and `5000` (backend) available

---

### 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/skincare-appointment-manager.git
cd skincare-appointment-manager

# 2. Build and start containers
docker-compose up --build

# 3. Visit in your browser:
Frontend: http://localhost:80
Backend API: http://localhost:5000
MongoDB: mongodb://localhost:27017 (via Docker network)
```

> ⏱️ First build may take a few minutes. Subsequent starts will be faster.

---

## 🛠️ Manual Setup (Without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env  # and fill in your values
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

> Ensure MongoDB is running locally or update `MONGO_URI` in `.env`.



---

## 📡 Real-Time Updates with Socket.IO

Socket.IO is integrated to provide:

- Live notifications when appointments are created, updated, or canceled
- Auto-refreshing appointment lists without page reload
- Admin dashboard showing live activity

Events emitted:

- `appointment:created`
- `appointment:updated`

Listen to these in your React components using the `socket` instance.

---

## 🗃️ Project Structure

```
skincare-appointment-manager/
├── docker-compose.yml          # Docker orchestration
├── backend/                    # Express + Socket.IO + Better Auth
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── sockets/            # Socket.IO event handlers
│   │   └── middleware/
│   └── .env.example
├── frontend/                   # React + Tailwind + Socket.IO Client
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/            # Auth & Socket context
│   │   └── utils/
│   └── .env.local
└── README.md
```

---


## 🌐 Environment Variables

See `.env.example` in both `backend/` and `frontend/` for required variables.

Key variables:

- `PORT` — Backend server port
- `MONGO_URI` — MongoDB connection string
- `BETTER_AUTH_SECRET` — Secret key for Better Auth
- `BETTER_AUTH_URL` — APP URl for Better Auth
 
---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---