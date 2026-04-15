# 🏥 Hospital Services Management - Frontend

A modern React-based web application for managing hospital services, including patient appointments, medical records, doctor management, pharmacy inventory, and donations.

⚠️ **Note:** This is a frontend demo version using mock data. All data is simulated and no real backend integration is required for testing.

---

## 🚀 Live Demo

🔗 **[Visit Live Demo](https://gestion-des-services-hospitalier-fr.vercel.app/login)**  
Test the application with credentials: `admin@hopital.fr` / `password123`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling & Responsive Design |
| **Vite** | Build Tool & Dev Server |
| **Shadcn/ui** | Component Library |
| **React Router** | Client-side Routing |
| **React Hook Form** | Form Management |
| **Zod** | Schema Validation |
| **TanStack Query** | Data Fetching |
| **Sonner** | Toast Notifications |

---

## ✨ Features

### 👨‍💼 Admin Features
- Dashboard overview with user statistics
- User management (create, block, archive)
- View all users by role
- Donation management

### 👤 Patient Features
- View and manage appointments
- Medical records access
- Download medical documents
- Schedule new appointments

### 👨‍⚕️ Doctor Features
- View patient list
- Manage appointments by patient
- Upload medical documents
- Manage medication orders

### 💊 Pharmacist Features
- Inventory management
- Low stock alerts
- Order validation & rejection
- Stock tracking

### 💝 Donor Features
- Create donations (money, materials, blood)
- Track donation history
- View donation status

---

## ⚠️ Important Notes

### Mock Data Mode
This project uses **mock data** by default (no backend required).

- ✅ All dashboards work with simulated data
- ⚠️ Data is lost on page refresh (in-memory only)

### Test Credentials

All users share the same password for easier testing:

```
Password: password123
```

**Available Users:**

| Email | Role |
|-------|------|
| admin@hopital.fr | Admin |
| patient@hopital.fr | Patient |
| medecin@hopital.fr | Doctor |
| pharmacien@hopital.fr | Pharmacist |
| donnateur@hopital.fr | Donor |

---

## ▶️ Run Locally

### Prerequisites
- Node.js 16+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gestion-des-services-hospitalier.git
cd Gestion-Des-Services-Hospitalier-Front

# Install dependencies
npm install

```

### Development Mode

```bash
# Start development server
npm run dev

---


## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React Context (Auth)
├── lib/
│   ├── api.ts       # API calls (mock & real)
│   ├── mockData.ts  # Mock data
│   └── utils.ts     # Utilities
├── pages/           # Page components
├── types/           # TypeScript types
└── App.tsx          # Main app
```

---

