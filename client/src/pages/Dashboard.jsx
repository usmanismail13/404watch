import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import "../Dashboard.css";

function Dashboard() {
  const [websites, setWebsites] = useState([]);
  const [errors, setErrors] = useState([]);
  const [lastScan, setLastScan] = useState(null);

  const [total404Errors, setTotal404Errors] = useState(0);
  const [recoveredErrors, setRecoveredErrors] = useState(0);
  const [activeErrors, setActiveErrors] = useState(0);

  // 🚨 Phase 9.10 — Selected error filter
  const [errorFilter, setErrorFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  // =========================================================
  // 📊 Fetch dashboard data
  // =========================================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        websitesResponse,
        errorsResponse,
        statsResponse,
      ] = await Promise.all([
        api.get("/api/websites"),
        api.get("/api/errors"),
        api.get("/api/dashboard/stats"),
      ]);

      const fetchedWebsites =
        websitesResponse.data.websites || [];

      const fetchedErrors =
        errorsResponse.data.errors || [];

      const stats = statsResponse.data || {};

      setWebsites(fetchedWebsites);
      setErrors(fetchedErrors);

      setTotal404Errors(stats.totalErrors || 0);
      setRecoveredErrors(stats.recoveredErrors || 0);
      setActiveErrors(stats.activeErrors || 0);
      setLastScan(stats.lastScan || null);
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

  // =========================================================
  // 🔍 Scan all monitored websites
  // =========================================================

  const handleScanAll = async () => {
    const monitoredWebsites = websites.filter(
      (website) => website.monitoringEnabled
    );

    if (monitoredWebsites.length === 0) {
      setScanMessage(
        "No websites with monitoring enabled."
      );

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

          totalErrors +=
            response.data.errorsFound || 0;

          latestScan = response.data.scan;
        } catch (err) {
          console.error(
            `Failed to scan ${website.url}:`,
            err.response?.data?.message ||
              err.message
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
        err.response?.data?.message ||
          "Failed to scan websites"
      );
    } finally {
      setScanning(false);
    }
  };

  // =========================================================
  // 🔄 Refresh dashboard
  // =========================================================

  const handleRefresh = async () => {
    await fetchDashboard();
  };

  // =========================================================
  // 🗑️ Delete website
  // =========================================================

  const handleDeleteWebsite = async (websiteId) => {
    const website = websites.find(
      (currentWebsite) =>
        currentWebsite.id === websiteId
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

      await api.delete(
        `/api/websites/${websiteId}`
      );

      setWebsites((currentWebsites) =>
        currentWebsites.filter(
          (currentWebsite) =>
            currentWebsite.id !== websiteId
        )
      );

      setScanMessage(
        "Website deleted successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete website"
      );
    }
  };

  // =========================================================
  // 🚨 Phase 9.10 — Determine error status
  // =========================================================
  //
  // Your backend currently returns:
  //
  // status: 404       → Active error
  // status: "recovered" → Recovered error
  //
  // We support both numeric and string 404 values.
  // =========================================================

  const isRecoveredError = (errorItem) => {
    return (
      String(errorItem.status).toLowerCase() ===
      "recovered"
    );
  };

  const isActiveError = (errorItem) => {
    return !isRecoveredError(errorItem);
  };

  // =========================================================
  // 🔢 Phase 9.10 — Error counts
  // =========================================================

  const allErrorCount = errors.length;

  const activeErrorCount = errors.filter(
    (errorItem) => isActiveError(errorItem)
  ).length;

  const recoveredErrorCount = errors.filter(
    (errorItem) => isRecoveredError(errorItem)
  ).length;

  // =========================================================
  // 🔍 Phase 9.10 — Filter errors
  // =========================================================

  const filteredErrors = errors.filter(
    (errorItem) => {
      if (errorFilter === "all") {
        return true;
      }

      if (errorFilter === "active") {
        return isActiveError(errorItem);
      }

      if (errorFilter === "recovered") {
        return isRecoveredError(errorItem);
      }

      return true;
    }
  );

  // =========================================================
  // 📊 Phase 9.10 — Filter result message
  // =========================================================

  const filteredResultMessage =
    errorFilter === "all"
      ? `Showing ${filteredErrors.length} error${
          filteredErrors.length === 1
            ? ""
            : "s"
        }`
      : errorFilter === "active"
      ? `Showing ${filteredErrors.length} active error${
          filteredErrors.length === 1
            ? ""
            : "s"
        }`
      : `Showing ${filteredErrors.length} recovered error${
          filteredErrors.length === 1
            ? ""
            : "s"
        }`;

  return (
    <div className="dashboard">

      {/* =====================================================
          🏠 Dashboard Header
      ===================================================== */}

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
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            onClick={handleScanAll}
            disabled={loading || scanning}
            style={{
              marginLeft: "10px",
            }}
          >
            {scanning
              ? "Scanning..."
              : "Scan Websites"}
          </button>

        </div>

      </div>

      {/* =====================================================
          ❌ Error message
      ===================================================== */}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* =====================================================
          ✅ Scan message
      ===================================================== */}

      {scanMessage && (
        <p style={{ color: "green" }}>
          {scanMessage}
        </p>
      )}

      {/* =====================================================
          📊 Dashboard Statistics
      ===================================================== */}

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h2>Monitored Websites</h2>
          <p>
            {websites.length} websites
          </p>
        </div>

        <div className="dashboard-card">
          <h2>404 Errors</h2>
          <p>
            {total404Errors} errors
          </p>
        </div>

        <div className="dashboard-card">
          <h2>Recovered Errors</h2>
          <p>
            {recoveredErrors} errors
          </p>
        </div>

        <div className="dashboard-card">
          <h2>Active Errors</h2>
          <p>
            {activeErrors} errors
          </p>
        </div>

        <div className="dashboard-card">
          <h2>Last Scan</h2>

          {lastScan ? (
            <p>
              🕐{" "}
              {new Date(
                lastScan
              ).toLocaleString()}
            </p>
          ) : (
            <p>
              🕐 Not scanned yet
            </p>
          )}
        </div>

      </div>

      {/* =====================================================
          🌐 Monitored Websites
      ===================================================== */}

      <div className="dashboard-websites">

        <h2>Monitored Websites</h2>

        {loading ? (

          <p>
            Loading websites...
          </p>

        ) : websites.length === 0 ? (

          <p>
            No websites are being
            monitored yet.
          </p>

        ) : (

          <div className="website-list">

            {websites.map((website) => (

              <div
                className="website-item"
                key={website.id}
              >

                <div>

                  <h3>
                    {website.url}
                  </h3>

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

                  <Link
                    to={`/website/${website.id}`}
                  >
                    View Website
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteWebsite(
                        website.id
                      )
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

      {/* =====================================================
          🚨 Phase 9.10 — Broken URLs
      ===================================================== */}

      <div className="dashboard-errors">

        <h2>
          🔗 Broken URLs
        </h2>

        {/* ===================================================
            🎛️ Error Filter Buttons
        =================================================== */}

        <div className="error-filters">

          <button
            type="button"
            className={
              errorFilter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setErrorFilter("all")
            }
          >
            📋 All ({allErrorCount})
          </button>

          <button
            type="button"
            className={
              errorFilter === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setErrorFilter("active")
            }
          >
            🔴 Active ({activeErrorCount})
          </button>

          <button
            type="button"
            className={
              errorFilter === "recovered"
                ? "active"
                : ""
            }
            onClick={() =>
              setErrorFilter("recovered")
            }
          >
            🟢 Recovered (
            {recoveredErrorCount}
            )
          </button>

        </div>

        {/* ===================================================
            📊 Filtered result count
        =================================================== */}

        {!loading &&
          errors.length > 0 && (
            <p className="filtered-results-count">
              {filteredResultMessage}
            </p>
          )}

        {/* ===================================================
            📡 Loading
        =================================================== */}

        {loading ? (

          <p>
            Loading broken URLs...
          </p>

        ) : errors.length === 0 ? (

          <p>
            No broken URLs found.
          </p>

        ) : filteredErrors.length === 0 ? (

          /* =================================================
             📭 Filter-specific empty state
          ================================================= */

          <p>
            {errorFilter === "all"
              ? "No broken URLs found."
              : errorFilter === "active"
              ? "No active 404 errors found."
              : "No recovered 404 errors found."}
          </p>

        ) : (

          /* =================================================
             🔗 Filtered error list
          ================================================= */

          <div className="error-list">

            {filteredErrors.map(
              (errorItem) => {

                const isRecovered =
                  isRecoveredError(
                    errorItem
                  );

                return (

                  <div
                    className={`error-item ${
                      isRecovered
                        ? "error-item-recovered"
                        : "error-item-active"
                    }`}
                    key={errorItem.id}
                  >

                    {/* =====================================
                        🚨 Error Header
                    ===================================== */}

                    <div className="error-item-header">

                      <h3>
                        🔗{" "}
                        {errorItem.url}
                      </h3>

                      <span
                        className={
                          isRecovered
                            ? "error-status error-status-recovered"
                            : "error-status error-status-active"
                        }
                      >
                        {isRecovered
                          ? "🟢 Recovered"
                          : "🔴 Active"}
                      </span>

                    </div>

                    {/* =====================================
                        🌐 Website
                    ===================================== */}

                    <p>
                      🌐 Website:{" "}
                      {errorItem.website
                        ?.url ||
                        "Unknown"}
                    </p>

                    {/* =====================================
                        📄 Source page
                    ===================================== */}

                    <p>
                      📄 Source Page:{" "}
                      {errorItem.sourceUrl ||
                        "Unknown"}
                    </p>

                    {/* =====================================
                        🚨 HTTP Status
                    ===================================== */}

                    <p>
                      🚨 Status:{" "}
                      {errorItem.status}
                    </p>

                    {/* =====================================
                        🕐 Detection time
                    ===================================== */}

                    <p>
                      🕐 Detected:{" "}
                      {errorItem.detectedAt
                        ? new Date(
                            errorItem.detectedAt
                          ).toLocaleString()
                        : "Unknown"}
                    </p>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          ➕ Add Website
      ===================================================== */}

      <div>
        <Link to="/website">
          <button type="button">
            Add Website
          </button>
        </Link>
      </div>

      {/* =====================================================
          💳 Billing
      ===================================================== */}

      <div>
        <Link to="/billing">
          <button type="button">
            Billing
          </button>
        </Link>
      </div>

    </div>
  );
}

export default Dashboard;
