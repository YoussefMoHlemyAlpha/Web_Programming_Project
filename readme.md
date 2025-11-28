# Food Ordering App

A full-stack web application for ordering food, designed to streamline the process for Customers, Administrators, and Delivery Personnel.

## 🚀 Features

### 👤 User (Customer)
*   **Authentication**: Secure Sign Up and Login.
*   **Browse Menu**: View available food items and filter by categories.
*   **Cart Management**: Add items to the shopping cart and review them before checkout.
*   **Order Placement**: Place orders seamlessly.
*   **Order Tracking**: Track order status in real-time (Pending -> Preparing -> On the Way -> Delivered).
*   **Reviews**: Leave reviews for food items.

### 🛠 Admin
*   **Dashboard**: Comprehensive overview of the system status.
*   **Menu Management**: Add, edit, and delete menu items.
*   **Category Management**: Organize food items into categories.
*   **Order Management**: View all orders and their statuses.
*   **Reports**: Generate and export sales reports as PDF files.
*   **Delivery Management**: Create and manage delivery personnel accounts.

### 🚚 Deliveryman
*   **Dashboard**: Dedicated interface for delivery tasks.
*   **Order Assignment**: View orders ready for delivery ("Preparing").
*   **Status Updates**: Accept orders (changing status to "On the Way") and mark them as "Delivered" upon completion.

## 💻 Tech Stack

### Frontend
*   **React**: UI library for building interactive interfaces.
*   **Vite**: Fast build tool and development server.
*   **React Router DOM**: For client-side routing.
*   **Axios**: For making HTTP requests to the backend.
*   **CSS**: Custom styling for a unique look and feel.

### Backend
*   **Node.js & Express**: Robust runtime and framework for the API.
*   **MongoDB & Mongoose**: NoSQL database and ODM for data modeling.
*   **JWT (JSON Web Tokens)**: Secure authentication and authorization.
*   **Bcryptjs**: Password hashing for security.
*   **Multer**: Handling file uploads (e.g., food images).
*   **PDFKit**: Generating PDF reports for admins.

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Web_Programming_Project
    ```

2.  **Install Dependencies**
    Run the following command from the root directory to install dependencies for both frontend and backend:
    ```bash
    npm run install-all
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=5000
    Mongo_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

4.  **Run the Application**
    Start both the frontend and backend servers concurrently:
    ```bash
    npm run dev
    ```

    *   **Frontend**: http://localhost:5173 (typically)
    *   **Backend**: http://localhost:5000

## 📂 Project Structure

```
├── backend/                # Node.js/Express Backend
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & other middleware
│   └── ...
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── pages/          # Application views (Admin, Delivery, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # State management
│   │   └── ...
└── package.json            # Root configuration & scripts
```
