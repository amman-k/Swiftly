# Swiftly: A Real-Time Trello Clone

Swiftly is a modern, full-stack task management application inspired by Trello. It's built with the MERN stack where users can manage their projects and tasks seamlessly.

### ✨ Core Features

* **Google OAuth Authentication:** Secure and easy login/signup using a Google account.
* **Project Boards:** Users can create, view, update, and delete their own project boards.
* **Customizable Lists & Cards:** Within each board, users can create, edit, and delete lists (columns) and cards (tasks).
* **Real-Time Collaboration:** All changes—creating, editing, deleting, and moving items—are broadcast instantly to all users viewing the same board using **Socket.io**.
* **Full Drag & Drop:**
    * Reorder cards vertically within the same list.
    * Move cards between different lists.
    * Reorder entire lists horizontally.
* **Modern & Responsive UI:** A beautiful, dark-themed interface built with Tailwind CSS that works seamlessly on desktop, tablet, and mobile devices.

### 🛠️ Technology Stack

This project is a monorepo with a separate backend and frontend.

**Backend:**

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** Passport.js (Google OAuth 2.0 Strategy) with Express Sessions
* **Real-Time Engine:** Socket.io

**Frontend:**

* **Framework:** React.js (with Vite)
* **Styling:** Tailwind CSS
* **State Management:** React Context API
* **API Requests:** Axios
* **Animations:** Framer Motion
* **Drag & Drop:** dnd-kit
* **Notifications:** React Hot Toast

### 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

#### Prerequisites

* Node.js (v18 or later)
* npm
* MongoDB (A local instance or a free Atlas account)

#### Backend Setup

1.  **Navigate to the backend folder:**
    ```bash
    cd swiftly/backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the `swiftly/backend` directory and add the following variables. You'll need to get your credentials from MongoDB Atlas and the Google Cloud Console.
    ```env
    MONGO_URI="your_mongodb_connection_string"
    PORT=5001
    SESSION_SECRET="your_random_session_secret_string"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    ```

4.  **Start the backend server:**
    ```bash
    nodemon server.js
    ```
    The server should now be running on `http://localhost:5001`.

#### Frontend Setup

1.  **Navigate to the frontend folder:**
    ```bash
    cd swiftly/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The application should now be accessible at `http://localhost:5173`. The Vite proxy will automatically forward any API requests to your backend.
