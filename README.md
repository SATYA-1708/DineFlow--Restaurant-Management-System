# 🍽️ DineFlow — Full-Stack Restaurant Management & POS Platform

**DineFlow** is an enterprise-grade, modern Restaurant Management & POS system built with **Java 17 Spring Boot 3.2** (backend) and **React 19 + Vite** (frontend). It features JWT authentication, role-based access control (`ADMIN`, `STAFF`, `CUSTOMER`), real-time WebSocket communication, live dining room table management, order preparation workflows, analytics, and an interactive customer ordering lounge.

---

## ✨ Features

- **🛡️ Authentication & Authorization**: Secure stateless JWT auth with role hierarchy (`ADMIN`, `STAFF`, `CUSTOMER`).
- **📊 Real-Time Operations Dashboard**: KPI cards, revenue analytics, dining floor occupancy pie charts, and top-selling dishes with Recharts.
- **🛍️ Live Order Management & Kitchen Display**: Complete order lifecycle pipeline (`PENDING` → `CONFIRMED` → `IN_PROGRESS` → `READY` → `SERVED` → `CLOSED`), parcel takeaway support, and bill settlement modal.
- **🪑 Dining Tables & Floor Layout**: Real-time table capacity tracking, sections (Window Bay, Main Hall, Rooftop Patio), and interactive status updates (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`).
- **📅 Table Reservation Engine**: Advance dining reservations with party size, notes, timestamps, and check-in confirmation.
- **🍲 Menu Catalog & Dish Pricing**: Category grouping, recipe details, preparation time estimates, instant stock toggling, and Indian Rupee (₹) pricing.
- **👥 User Directory**: Live search, role filter pills, status management, and permission overrides.
- **💬 Staff & Kitchen Messaging**: Real-time order-specific chat system powered by WebSockets / REST polling.
- **📱 Responsive Modern UI**: Premium glassmorphism, responsive sidebar, Lucide SVG icons, and Plus Jakarta Sans typography.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Security 6, Hibernate / Spring Data JPA |
| **Database** | MySQL 8.x |
| **Authentication** | JWT (io.jsonwebtoken JJWT 0.11.5) |
| **API Documentation** | Swagger UI / OpenAPI 3.0 (`/swagger-ui.html`) |
| **Real-Time Communication** | Spring WebSocket (STOMP + SockJS) |
| **Frontend** | React 19, Vite 8, React Router 7, Recharts, Lucide React, React Hot Toast |
| **Build Tools** | Maven 3.9+ (Maven Wrapper included), Node.js 18+ |

---

## 📁 Repository Structure

```
DineFlow/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/rms/backend/
│   │   ├── config/             # SecurityConfig, WebSocketConfig, DataSeeder, OpenApiConfig
│   │   ├── controller/         # REST Controllers (Auth, Menu, Order, Table, Reservation, User, etc.)
│   │   ├── dto/                # Request & Response DTOs
│   │   ├── entity/             # JPA Database Entities
│   │   ├── exception/          # GlobalExceptionHandler & Custom Exceptions
│   │   ├── repository/         # Spring Data JPA Repositories
│   │   ├── security/           # JWT Authentication Filters & Token Provider
│   │   └── service/            # Business Logic & Implementations
│   ├── src/main/resources/
│   │   └── application.properties # App configuration with cloud env variable fallbacks
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── components/         # AdminLayout, CustomerLayout, ChatBox, OrderProgress
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/              # Dashboard, Orders, Tables, Reservations, Menu, Users, Reports, Auth
│   │   ├── services/           # Axios API Client (`api.js`)
│   │   ├── App.jsx & index.css # Global routing & custom design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Java 17+** (JDK 17)
- **Node.js 18+** & **npm**
- **MySQL 8.x** running locally or in cloud

### 2. Configure Database
In `backend/src/main/resources/application.properties`, configure your MySQL credentials or supply environment variables:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rms_db_sp?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Start Backend (Port 8081)
```bash
cd backend
./mvnw clean spring-boot:run
```
*The `DataSeeder` automatically bootstraps categories, dishes, tables, sample orders, and demo accounts on first boot.*

### 4. Start Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@rms.com` | `admin123` |
| **Staff** | `staff@rms.com` | `staff123` |
| **Customer** | `customer@rms.com` | `customer123` |

---

## 📖 API Documentation & Swagger

Once the backend is running, access the interactive Swagger documentation at:
**[http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)**

---

## 🌐 Production Deployment

### Environment Variables
The application reads standard production environment variables:
- `PORT` — Backend listening port (default: `8081`)
- `SPRING_DATASOURCE_URL` — Production JDBC database URL
- `SPRING_DATASOURCE_USERNAME` — Database user
- `SPRING_DATASOURCE_PASSWORD` — Database password
- `JWT_SECRET` — 256-bit secret key for signing tokens
- `VITE_API_URL` — (Frontend) Direct backend API base URL (e.g., `https://api.dineflow.com/api/v1`)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
