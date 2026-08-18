import Register from "./pages/Register";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";

function App() {
  return (
    <BrowserRouter>
      {/* Pricing page created in Phase 2.10 */}
      <Pricing />
    </BrowserRouter>
  );
}

export default App;