import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Alert from "./components/Alert";
import Loading from "./components/Loading";
import Error from "./components/Error";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<h1>404Watch Home</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<h1>Registration</h1>} />
        <Route path="/pricing" element={<h1>Pricing</h1>} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/error" element={<Error />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
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