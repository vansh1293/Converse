

# Converse - Full Stack Realtime Chat Application

## Overview

Converse is a full-stack real-time chat application that provides seamless communication with a modern and responsive design. It supports features like user authentication, real-time messaging, AI-powered responses, and video/audio calling.

---

## Features

### Client-Side Features
1. **User Authentication**:
   - Login and Signup with email and password.
   - Email verification using OTP.

2. **Real-Time Messaging**:
   - Send and receive text messages.
   - Support for multimedia (images, audio).

3. **AI-Powered Responses**:
   - Integration with AI to generate responses.

4. **Video/Audio Calling**:
   - Initiate and receive video/audio calls.
   - Call management (accept, reject, end).

5. **User Profile Management**:
   - Update profile details (name, about, profile picture).

6. **Responsive Design**:
   - Optimized for both desktop and mobile devices.

7. **Dark Mode**:
   - Toggle between light and dark themes.

---

### Server-Side Features
1. **Authentication**:
   - JWT-based authentication.
   - Secure password hashing with bcrypt.

2. **Database**:
   - MongoDB for storing user and message data.

3. **File Uploads**:
   - Cloudinary integration for storing images and audio files.

4. **WebSocket Communication**:
   - Real-time communication using `socket.io`.

5. **RESTful APIs**:
   - Endpoints for user authentication, messaging, and calling.

6. **Environment Configuration**:
   - Secure environment variables for sensitive data.

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Cloudinary account
- Email service credentials (e.g., Gmail)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/converse.git
   cd converse
   ```

2. Install dependencies:
   ```bash
   npm install --prefix Client
   npm install --prefix Server
   ```

3. Build the client:
   ```bash
   npm run build --prefix Client
   ```

4. Set up environment variables:
   - Create `.env` files in both `Client` and `Server` directories.
   - Add the following variables:

---

## Environment Variables

### Server `.env`
```env
MONGODB_URI=<your-mongodb-uri>
PORT=3000
JWT_SECRET=<your-jwt-secret>
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CLIENT_KEY=http://localhost:5173
EMAIL_USER=<your-email-address>
EMAIL_PASS=<your-email-password>
GEMINI_API_KEY=<your-gemini-api-key>
```

### Client `.env`
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## Running the Application

1. Start the server:
   ```bash
   npm run start --prefix Server
   ```

2. Start the client (for development):
   ```bash
   npm run dev --prefix Client
   ```

3. Access the application:
   - Open your browser and navigate to `http://localhost:5173`.

---

## Folder Structure

### Client
- **`src/`**: Contains React components, hooks, pages, and assets.
- **`public/`**: Static assets like icons and images.
- **`tailwind.config.js`**: Tailwind CSS configuration.
- **`vite.config.js`**: Vite configuration for the client.

### Server
- **`src/`**: Contains controllers, routes, middleware, and utility functions.
- **`models/`**: Mongoose models for MongoDB.
- **`lib/`**: Utility libraries (e.g., Cloudinary, Socket.io).
- **`routes/`**: API route definitions.

---

## API Endpoints

### Authentication
- `POST /auth/signup`: Register a new user.
- `POST /auth/login`: Login a user.
- `POST /auth/logout`: Logout a user.

### Messaging
- `GET /message/users`: Fetch users for the sidebar.
- `GET /message/:id`: Fetch messages with a specific user.
- `POST /message/send-message/:id`: Send a message.
- `DELETE /message/delete-message`: Delete a message.

### Calling
- `POST /message/generateCall`: Initiate a call.
- `POST /message/acceptCall`: Accept a call.
- `POST /message/rejectCall`: Reject a call.
- `POST /message/endCall`: End a call.

---

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- Vite
- Redux Toolkit
- Simple-Peer (WebRTC)

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io
- Cloudinary

---

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the MIT License.
