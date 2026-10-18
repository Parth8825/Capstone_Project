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
  * Administrator login and operator-managed account provisioning with hashed passwords (`bcrypt`).
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
* **Email Service:** `nodemailer`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v22 or higher) & `npm`
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
   npm ci
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (you can copy `.env.example`):
   ```env
   PORT=8080
   MONGO_DATABASE_URL=mongodb://127.0.0.1:27017/capstone_db
   SESSION_SECRET=<generate-a-random-secret-of-at-least-32-characters>
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the Application:**
   * **Development mode (Node watch):**
     ```bash
     npm run dev
     ```
   * **Standard mode:**
     ```bash
     npm start
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

* Run `npm audit` against the committed lockfile to check current dependency advisories. Audit results are time-dependent and do not replace an application security review.
* **Environment Credentials:** Sensitive data (MongoDB URIs, Email credentials, Session secrets) are stored in `.env` and kept out of version control.

---

## 📄 License

This project is licensed under the **ISC License**.

## Security configuration and migration

- Set a random `SESSION_SECRET` of at least 32 characters (for example, generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Startup fails if it is missing or too short.
- Sessions are persisted in MongoDB. Production requires HTTPS and `NODE_ENV=production` for secure cookies. Set `TRUST_PROXY=1` only behind exactly one trusted reverse proxy that overwrites forwarded client headers; otherwise leave it unset.
- Public signup is disabled because every account can access all employee/payroll data. Existing accounts still work. To provision an administrator, supply `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` through your shell's secret input or a temporary local environment, then run `npm run create-admin`. Remove these variables afterward. Do not commit credentials. New/reset passwords require 12 characters and at most 72 UTF-8 bytes.
- Existing reset codes are invalidated by the new schema. Request a new code; codes last five minutes, are session-bound and single-use, and allow at most five guesses. Keep the same browser session open during recovery. Old OTP documents without `expiresAt` can be removed by an operator after deployment.
- Delete and logout actions now require POST with a session CSRF token. All HTML forms include this token.
- Login and password recovery share a limit of 10 requests per IP per 15 minutes. The limiter uses process-local storage; use a shared rate-limit store before scaling to multiple application instances.
- `npm test` runs HTTP security regression tests with mocked database/email operations. A real MongoDB/Gmail deployment smoke test is still required before release. Review existing administrator accounts, because accounts created through the former public signup remain authorized.
