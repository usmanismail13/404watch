import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../Dashboard.css";

function Dashboard() {
  const [websites, setWebsites] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [lastScan, setLastScan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [websitesResponse, errorsResponse] = await Promise.all([
        api.get("/api/websites"),
        api.get("/api/errors"),
      ]);

      setWebsites(websitesResponse.data.websites || []);
      setErrorCount((errorsResponse.data.errors || []).length);
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

      setLastScan(latestScan);

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
          <p>{errorCount} errors</p>
        </div>

        <div className="dashboard-card">
          <h2>Last Scan</h2>

          {lastScan ? (
            <p>
              Scan status: {lastScan.status}
            </p>
          ) : (
            <p>Scan status: Not scanned yet</p>
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

                  <p>
                    Monitoring:{" "}
                    {website.monitoringEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </p>
                </div>

                <Link to={`/website/${website.id}`}>
                  View Website
                </Link>
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
