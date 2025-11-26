import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import PatientAppointments from "./pages/patient/Appointments";
import PatientMedicalRecords from "./pages/patient/MedicalRecords";
import AdminUsers from "./pages/admin/Users";
import AdminStatistics from "./pages/admin/Statistics";
import MedecinPatients from "./pages/medecin/Patients";
import MedecinOrders from "./pages/medecin/Orders";
import PharmacienInventory from "./pages/pharmacien/Inventory";
import PharmacienOrders from "./pages/pharmacien/Orders";
import DonnateurDonations from "./pages/donnateur/Donations";
import DonnateurNewDonation from "./pages/donnateur/NewDonation";
import SharedOrders from "./pages/shared/Orders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Patient Routes */}
            <Route
              path="/appointments"
              element={
                <ProtectedRoute allowedRoles={['patient', 'medecin']}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientMedicalRecords />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminStatistics />
                </ProtectedRoute>
              }
            />
            
            {/* Médecin Routes */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={['medecin']}>
                  <MedecinPatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['medecin', 'pharmacien']}>
                  <SharedOrders />
                </ProtectedRoute>
              }
            />
            
            {/* Pharmacien Routes */}
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['pharmacien']}>
                  <PharmacienInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-alerts"
              element={
                <ProtectedRoute allowedRoles={['pharmacien']}>
                  <PharmacienInventory />
                </ProtectedRoute>
              }
            />
            
            {/* Donateur Routes */}
            <Route
              path="/donations"
              element={
                <ProtectedRoute allowedRoles={['donnateur']}>
                  <DonnateurDonations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-donation"
              element={
                <ProtectedRoute allowedRoles={['donnateur']}>
                  <DonnateurNewDonation />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
