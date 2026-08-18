import { Link } from "react-router-dom";
import "../Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to 404Watch.</p>
        </div>

        <button type="button">Refresh</button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Monitored Websites</h2>
          <p>0 websites</p>
        </div>

        <div className="dashboard-card">
          <h2>404 Errors</h2>
          <p>0 errors</p>
        </div>

        <div className="dashboard-card">
          <h2>Last Scan</h2>
          <p>Scan status: Not scanned yet</p>
        </div>
      </div>

      <div className="dashboard-websites">
        <h2>Monitored Websites</h2>
        <p>No websites are being monitored yet.</p>
      </div>

      <div>
        <Link to="/billing">
          <button type="button">Billing</button>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;