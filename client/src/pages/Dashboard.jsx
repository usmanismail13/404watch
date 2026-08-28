import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../Dashboard.css";

function Dashboard() {
  const [websites, setWebsites] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [lastScan, setLastScan] = useState(null);
  const [total404Errors, setTotal404Errors] = useState(0);
  const [recoveredErrors, setRecoveredErrors] = useState(0);
  const [activeErrors, setActiveErrors] = useState(0);

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [websitesResponse, errorsResponse, statsResponse] =
        await Promise.all([
          api.get("/api/websites"),
          api.get("/api/errors"),
          api.get("/api/dashboard/stats"),
        ]);

      setWebsites(websitesResponse.data.websites || []);
      setErrorCount((errorsResponse.data.errors || []).length);
      setTotal404Errors(statsResponse.data.totalErrors || 0);
      setRecoveredErrors(statsResponse.data.recoveredErrors || 0);
      setActiveErrors(statsResponse.data.activeErrors || 0);
      setLastScan(statsResponse.data.lastScan || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleScanAll = async () => {
    const monitoredWebsites = websites.filter(
      (website) => website.monitoringEnabled
    );

    if (monitoredWebsites.length === 0) {
      setScanMessage("No websites with monitoring enabled.");
      return;
    }

    try {
      setScanning(true);
      setError("");
      setScanMessage("");

      let totalErrors = 0;
      let latestScan = null;

      for (const website of monitoredWebsites) {
        try {
          const response = await api.post(
            `/api/scans/${website.id}`
          );

          totalErrors += response.data.errorsFound || 0;
          latestScan = response.data.scan;
        } catch (err) {
          console.error(
            `Failed to scan ${website.url}:`,
            err.response?.data?.message || err.message
          );
        }
      }

      setLastScan(
        latestScan?.completedAt ||
          latestScan?.startedAt ||
          null
      );

      await fetchDashboard();

      setScanMessage(
        `Scan completed. ${totalErrors} 404 error${
          totalErrors === 1 ? "" : "s"
        } found.`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to scan websites"
      );
    } finally {
      setScanning(false);
    }
  };

  const handleRefresh = async () => {
    await fetchDashboard();
  };

  const handleDeleteWebsite = async (websiteId) => {
    const website = websites.find(
      (currentWebsite) => currentWebsite.id === websiteId
    );

    if (!website) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${website.url}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setScanMessage("");

      await api.delete(`/api/websites/${websiteId}`);

      setWebsites((currentWebsites) =>
        currentWebsites.filter(
          (currentWebsite) => currentWebsite.id !== websiteId
        )
      );

      setScanMessage("Website deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete website"
      );
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to 404Watch.</p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || scanning}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleScanAll}
            disabled={loading || scanning}
            style={{ marginLeft: "10px" }}
          >
            {scanning ? "Scanning..." : "Scan Websites"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {scanMessage && (
        <p style={{ color: "green" }}>
          {scanMessage}
        </p>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Monitored Websites</h2>
          <p>{websites.length} websites</p>
        </div>

        <div className="dashboard-card">
          <h2>404 Errors</h2>
          <p>{total404Errors} errors</p>
        </div>

        <div className="dashboard-card">
          <h2>Recovered Errors</h2>
          <p>{recoveredErrors} errors</p>
        </div>

        <div className="dashboard-card">
          <h2>Active Errors</h2>
          <p>{activeErrors} errors</p>
        </div>

        <div className="dashboard-card">
          <h2>Last Scan</h2>

          {lastScan ? (
            <p>
              🕐 {new Date(lastScan).toLocaleString()}
            </p>
          ) : (
            <p>🕐 Not scanned yet</p>
          )}
        </div>
      </div>

      <div className="dashboard-websites">
        <h2>Monitored Websites</h2>

        {loading ? (
          <p>Loading websites...</p>
        ) : websites.length === 0 ? (
          <p>No websites are being monitored yet.</p>
        ) : (
          <div className="website-list">
            {websites.map((website) => (
              <div
                className="website-item"
                key={website.id}
              >
                <div>
                  <h3>{website.url}</h3>

                  <span
                    className={
                      website.monitoringEnabled
                        ? "monitoring-status monitoring-status-enabled"
                        : "monitoring-status monitoring-status-disabled"
                    }
                  >
                    <span className="monitoring-status-dot"></span>

                    {website.monitoringEnabled
                      ? "Monitoring Enabled"
                      : "Monitoring Disabled"}
                  </span>
                </div>

                <div className="website-actions">
                  <Link to={`/website/${website.id}`}>
                    View Website
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteWebsite(website.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Link to="/website">
          <button type="button">Add Website</button>
        </Link>
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