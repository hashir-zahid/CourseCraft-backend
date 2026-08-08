# 🎓 CourseCraft

A robust, production-grade RESTful API and Backend architecture built for modern E-Learning platforms. Built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **Cloudinary**, this application supports multi-role access (Students & Instructors), secure authentication via HTTP-Only JWT cookies, media uploads, and structured video course management.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
- [API Endpoints Overview](#-api-endpoints-overview)
  - [Authentication & User Management](#1-authentication--user-management)
  - [Course Management](#2-course-management)
  - [Lesson Management](#3-lesson-management)
  - [System Health](#4-system-health)
- [Testing & Validation](#-testing--validation)
- [Security Features](#-security-features)
- [License](#-license)

---

## ✨ Key Features

- 🔐 **Dual Authentication & Role-Based Access Control (RBAC)**
  - Roles: `student` and `instructor`.
  - Secure signup/login with password hashing via **bcrypt**.
  - Dual-token workflow using **Short-Lived Access Tokens** and **Long-Lived Refresh Tokens**.
  - Cookie-based authentication (`httpOnly`, `sameSite`, `secure`) for XSS protection.

- 📚 **Course Lifecycle Management**
  - Instructors can create, update, and manage structured video courses.
  - Image thumbnail uploads directly stored and optimized via **Cloudinary**.
  - Categorization, pricing model, and experience level tiering (`beginner`, `intermediate`, `advanced`).

- 📹 **Lesson & Video Streaming Management**
  - Section-based video lesson attachments.
  - Free preview toggles for prospective students.
  - Automatic video processing and cloud hosting via Multer and Cloudinary.

- 📊 **User Watch History & Analytics**
  - Automatic watch history tracking populated with instructor metadata.
  - Public course search and discovery endpoints.

---

## 🛠 Tech Stack & Architecture

- **Runtime Environment:** Node.js (ES Modules)
- **Web Framework:** Express.js
- **Database:** MongoDB Atlas / Local MongoDB via Mongoose ODM
- **Media Cloud Hosting:** Cloudinary API
- **File Parsing & Handling:** Multer (Local temp disk buffer storage)
- **Security & Utilities:** `jsonwebtoken`, `bcrypt`, `cors`, `cookie-parser`, `dotenv`, `prettier`

---

## 📁 Project Structure

```text
├── public/
│   └── temp/               # Temporary storage for file uploads before Cloudinary sync
├── src/
│   ├── controllers/        # Request handlers & business logic
│   │   ├── course.controller.js
│   │   ├── lesson.controller.js
│   │   └── user.controller.js
│   ├── db/                 # Database connection setup
│   │   └── index.js
│   ├── middlewares/        # Custom middlewares (JWT verify, Multer, Role Check)
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── models/             # Mongoose schemas & data models
│   │   ├── course.model.js
│   │   ├── lesson.model.js
│   │   └── user.model.js
│   ├── routes/             # API Router declarations
│   │   ├── course.routes.js
│   │   ├── lesson.routes.js
│   │   └── user.routes.js
│   ├── utils/              # Helper utilities (ApiError, ApiResponse, asyncHandler, Cloudinary)
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js              # Express app initialization & middleware configuration
│   └── index.js            # Server entry point
├── test.html               # Interactive browser-based API testing harness
├── .env.example            # Environment variable template
└── package.json            # Dependencies & scripts
```
---

# 🧪 Testing & Validation

A built-in interactive browser tester (`test.html`) is provided to simulate the full user workflow without needing external API clients like Postman.

### Running tests with `test.html`:
Serve `test.html` using a local HTTP server (e.g., **Live Server** in VS Code or `npx http-server .`).

1. **Register Instructor** to create an instructor account.
2. **Login User** with the credentials. This stores the `accessToken` in your browser session cookies.
3. **Create Course** with a thumbnail image selected to verify course creation.

---

# 🔒 Security Features

* **XSS & CSURF Prevention:** Authentication tokens are stored in `httpOnly` cookies, preventing malicious JavaScript access.
* **Sanitized Database Queries:** Input sanitization (`.trim()`, `.toLowerCase()`) prevents case-sensitivity mismatches and query injection risks.
* **Role Verification Middlewares:** Custom Express middlewares double-check user authorization on sensitive instructor routes (`verifyInstructor`).