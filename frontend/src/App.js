import { Routes, Route, BrowserRouter } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/Home";
import SpecialitiesPage from "@/pages/Specialities";
import DoctorsPage from "@/pages/Doctors";
import DoctorProfilePage from "@/pages/DoctorProfile";
import ServicesPage from "@/pages/Services";
import AboutPage from "@/pages/About";
import ContactPage from "@/pages/Contact";
import AppointmentsPage from "@/pages/Appointments";
import AdminLoginPage from "@/pages/AdminLogin";
import AdminDashboardPage from "@/pages/AdminDashboard";

const publicPage = (node) => <Layout>{node}</Layout>;

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={publicPage(<HomePage />)} />
            <Route path="/specialities" element={publicPage(<SpecialitiesPage />)} />
            <Route path="/doctors" element={publicPage(<DoctorsPage />)} />
            <Route path="/doctors/:id" element={publicPage(<DoctorProfilePage />)} />
            <Route path="/services" element={publicPage(<ServicesPage />)} />
            <Route path="/about" element={publicPage(<AboutPage />)} />
            <Route path="/contact" element={publicPage(<ContactPage />)} />
            <Route path="/appointments" element={publicPage(<AppointmentsPage />)} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={publicPage(<HomePage />)} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </div>
  );
}

export default App;
