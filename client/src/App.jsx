import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<h1>404Watch Home</h1>} />
        <Route path="/login" element={<h1>Login</h1>} />
        <Route path="/register" element={<h1>Registration</h1>} />
        <Route path="/pricing" element={<h1>Pricing</h1>} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          <Route path="/website" element={<h1>Website</h1>} />
          <Route path="/errors" element={<h1>404 Errors</h1>} />
          <Route path="/account" element={<h1>Account</h1>} />
          <Route path="/billing" element={<h1>Billing</h1>} />
          <Route path="/support" element={<h1>Support</h1>} />
        </Route>

        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;