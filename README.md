# Employee Management System (EMS) — Capstone Project

Academic Capstone Project developed for **Conestoga College**.

---

## 📌 Project Overview

The **Employee Management System (EMS)** is a full-stack web application built to streamline operations for workforce management. It provides a centralized platform for managing employee records, inventory tracking, shift scheduling, attendance monitoring, and automated paystub generation with PDF export capabilities.

### 👥 Team PRT
* **Parth Darji**
* **Renil Navadiya**
* **Tara Ramnaraina**

---

## ✨ Key Features

* 🔐 **Authentication & Security**
  * Secure Admin Login & Registration with hashed passwords (`bcrypt`).
  * OTP-based email password recovery via Nodemailer.
  * Session and cookie management with configurable secret keying.

* 👥 **Employee Management**
  * Full CRUD (Create, Read, Update, Delete) operations for employee profiles.
  * Tracks employee details: contact info, position, pay rate, and address.

* 📦 **Inventory Management**
  * Track stock items, quantities, unit prices, received dates, and remaining inventory.

* 📅 **Shift Scheduling**
  * Create, update, and organize employee work schedules.

* ⏱️ **Attendance Tracking**
  * Monitor and view employee attendance logs.

* 📄 **Paystub Generation & PDF Export**
  * Automatic calculation of gross pay, Canadian tax deductions (CPP, EI, Federal & Provincial taxes), and take-home pay.
  * Direct PDF generation and download powered by `pdfkit`.

---

## 🛠️ Technology Stack

* **Backend Environment:** Node.js
* **Web Framework:** Express.js (`^4.21.2`)
* **Database:** MongoDB via Mongoose ORM (`^6.13.10`)
* **View Engine:** EJS (Embedded JavaScript Templates)
* **Styling & Assets:** Custom CSS & static assets
* **PDF Service:** `pdfkit`
* **Email Service:** `nodemailer` (`^9.0.3`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher) & `npm`
* [MongoDB](https://www.mongodb.com/) (Local server via MongoDB Community Edition / Docker OR [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster)

---

### Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Parth8825/Capstone_Project.git
   cd Capstone_Project
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (you can copy `.env.example`):
   ```env
   PORT=8080
   MONGO_DATABASE_URL=mongodb://127.0.0.1:27017/capstone_db
   SESSION_SECRET=your_random_secure_secret_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the Application:**
   * **Development mode (with Nodemon):**
     ```bash
     npm start
     ```
   * **Standard mode:**
     ```bash
     node index.js
     ```

5. **Access the Web Application:**
   Open your browser and visit: `http://localhost:8080/`

---

## 📁 Project Structure

```
├── models/             # Mongoose schemas (Admin, Employee, Inventory, Paystub, Schedule, Attendance, OTP)
├── routes/             # Express routing modules
│   ├── mainRouter.js       # Dashboard & Employee CRUD
│   ├── loginRouter.js      # Auth & OTP password reset
│   ├── inventoryRouter.js  # Inventory management
│   ├── scheduleRouter.js   # Shift schedules
│   ├── attendanceRouter.js # Attendance logs
│   └── paystubRouter.js    # Paystub calculations
├── services/           # Helper services (PDF generation)
├── views/              # EJS template views
├── public/             # Static assets (CSS, JS, Images)
├── index.js            # Main application entry point
├── package.json        # Dependencies & scripts
└── .env.example        # Environment variable template
```

---

## 🔒 Security Status

* **Vulnerabilities Audit:** `0 vulnerabilities` (All dependencies updated & patched).
* **Environment Credentials:** Sensitive data (MongoDB URIs, Email credentials, Session secrets) are stored in `.env` and kept out of version control.

---

## 📄 License

This project is licensed under the **ISC License**.
