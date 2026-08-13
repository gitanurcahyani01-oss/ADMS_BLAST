import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import SmoothScroll from "./components/SmoothScroll";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import Home from "./pages/Home";
import Harga from "./pages/Harga";
import Testimoni from "./pages/Testimoni";
import Afiliasi from "./pages/Afiliasi";
import Demo from "./pages/Demo";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Invoice from "./pages/Invoice";
import SyaratKetentuan from "./pages/SyaratKetentuan";
import KebijakanPrivasi from "./pages/KebijakanPrivasi";

// Dashboard Pages
import Overview from "./pages/dashboard/Overview";
import UsersManagement from "./pages/dashboard/UsersManagement";
import BlastLogs from "./pages/dashboard/BlastLogs";
import Devices from "./pages/dashboard/Devices";
import AuditTrail from "./pages/dashboard/AuditTrail";
import Contacts from "./pages/dashboard/Contacts";
import Broadcast from "./pages/dashboard/Broadcast";
import AutoReply from "./pages/dashboard/AutoReply";
import Settings from "./pages/dashboard/Settings";
import Referral from "./pages/dashboard/Referral";

// Layout Wrapper for Public Pages
function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#07101E] text-[#1E293B] dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SmoothScroll>
          <Routes>
            {/* Public Landing Pages */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/harga"
              element={
                <PublicLayout>
                  <Harga />
                </PublicLayout>
              }
            />
            <Route
              path="/testimoni"
              element={
                <PublicLayout>
                  <Testimoni />
                </PublicLayout>
              }
            />
            <Route
              path="/afiliasi"
              element={
                <PublicLayout>
                  <Afiliasi />
                </PublicLayout>
              }
            />
            <Route
              path="/demo"
              element={
                <PublicLayout>
                  <Demo />
                </PublicLayout>
              }
            />

            <Route
              path="/syarat-ketentuan"
              element={
                <PublicLayout>
                  <SyaratKetentuan />
                </PublicLayout>
              }
            />
            <Route
              path="/kebijakan-privasi"
              element={
                <PublicLayout>
                  <KebijakanPrivasi />
                </PublicLayout>
              }
            />

            {/* Auth & Checkout Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/invoice/:invoiceNumber" element={<Invoice />} />

            {/* Protected Dashboard Routes with Multi-Role RBAC */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Accessible by Super Admin, Admin, and User based on permissions */}
              <Route index element={<Overview />} />
              <Route path="devices" element={<Devices />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="broadcast" element={<Broadcast />} />
              <Route path="auto-reply" element={<AutoReply />} />
              <Route path="logs" element={<BlastLogs />} />
              <Route path="referral" element={<Referral />} />
              <Route path="settings" element={<Settings />} />

              {/* Accessible by Super Admin and Admin Operasional */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                    <AuditTrail />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback Catch-All Route (Redirects smoothly to Home) */}
            <Route
              path="*"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
          </Routes>
        </SmoothScroll>
      </AuthProvider>
    </ThemeProvider>
  );
}
