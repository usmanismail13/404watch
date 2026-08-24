import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";
import Error from "./components/Error";
import MainLayout from "./layouts/MainLayout";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Website from "./pages/Website";
import Errors404 from "./pages/Errors404";
import Account from "./pages/Account";
import Billing from "./pages/Billing";
import Support from "./pages/Support";

import { useAuth } from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/error" element={<Error />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/website" element={<Website />} />
            <Route path="/errors" element={<Errors404 />} />
            <Route path="/account" element={<Account />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/support" element={<Support />} />
          </Route>

          <Route path="*" element={<h1>Page Not Found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;