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

  const [errorFilter, setErrorFilter] = useState("all");

  const [errorPage, setErrorPage] = useState(1);
  const [errorTotalPages, setErrorTotalPages] = useState(1);

  const errorLimit = 10;

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");

  // =========================================================
  // 📊 Fetch Dashboard
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
        api.get(
          `/api/errors?page=${errorPage}&limit=${errorLimit}`
        ),
        api.get("/api/dashboard/stats"),
      ]);

      const fetchedWebsites =
        websitesResponse.data.websites || [];

      const fetchedErrors =
        errorsResponse.data.errors || [];

      const stats =
        statsResponse.data || {};

      setWebsites(fetchedWebsites);
      setErrors(fetchedErrors);

      setTotal404Errors(
        stats.totalErrors || 0
      );

      setRecoveredErrors(
        stats.recoveredErrors || 0
      );

      setActiveErrors(
        stats.activeErrors || 0
      );

      setLastScan(
        stats.lastScan || null
      );

      setErrorTotalPages(
        errorsResponse.data.totalPages || 1
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [errorPage]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =========================================================
  // 🔄 Refresh
  // =========================================================

  const handleRefresh = async () => {
    await fetchDashboard();
  };

  // =========================================================
  // 🔍 Scan Websites
  // =========================================================

  const handleScanAll = async () => {
    const monitoredWebsites =
      websites.filter(
        (website) =>
          website.monitoringEnabled
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
          const response =
            await api.post(
              `/api/scans/${website.id}`
            );

          totalErrors +=
            response.data.errorsFound || 0;

          latestScan =
            response.data.scan;
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
  // 🗑️ Delete Website
  // =========================================================

  const handleDeleteWebsite = async (
    websiteId
  ) => {
    const website =
      websites.find(
        (currentWebsite) =>
          currentWebsite.id === websiteId
      );

    if (!website) {
      return;
    }

    const confirmed =
      window.confirm(
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

      setWebsites(
        (currentWebsites) =>
          currentWebsites.filter(
            (currentWebsite) =>
              currentWebsite.id !==
              websiteId
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
  // 🚨 Error Helpers
  // =========================================================

  const isRecoveredError = (
    errorItem
  ) => {
    return (
      String(errorItem.status)
        .toLowerCase() ===
      "recovered"
    );
  };

  const isActiveError = (
    errorItem
  ) => {
    return !isRecoveredError(
      errorItem
    );
  };

  // =========================================================
  // 🎛️ Filter Errors
  // =========================================================

  const allErrorCount =
    errors.length;

  const activeErrorCount =
    errors.filter(
      (errorItem) =>
        isActiveError(errorItem)
    ).length;

  const recoveredErrorCount =
    errors.filter(
      (errorItem) =>
        isRecoveredError(errorItem)
    ).length;

  const filteredErrors =
    errors.filter((errorItem) => {
      if (
        errorFilter === "active"
      ) {
        return isActiveError(
          errorItem
        );
      }

      if (
        errorFilter === "recovered"
      ) {
        return isRecoveredError(
          errorItem
        );
      }

      return true;
    });

  // =========================================================
  // 📄 Pagination
  // =========================================================

  const handlePreviousErrorPage =
    () => {
      setErrorPage(
        (currentPage) =>
          Math.max(
            currentPage - 1,
            1
          )
      );
    };

  const handleNextErrorPage =
    () => {
      setErrorPage(
        (currentPage) =>
          Math.min(
            currentPage + 1,
            errorTotalPages
          )
      );
    };

  return (
    <div className="dashboard">

      {/* =====================================================
          ✨ HERO HEADER
      ===================================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-glow"></div>

        <div className="dashboard-hero-content">

          <div className="dashboard-hero-badge">
            <span className="hero-status-dot"></span>
            404Watch Monitoring
          </div>

          <h1>
            Website Health
            <span> Dashboard</span>
          </h1>

          <p>
            Monitor your websites, discover
            broken links, and keep your digital
            presence healthy.
          </p>

        </div>

        <div className="dashboard-hero-actions">

          <button
            type="button"
            className="hero-refresh-button"
            onClick={handleRefresh}
            disabled={
              loading || scanning
            }
          >
            <span>↻</span>
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            type="button"
            className="hero-scan-button"
            onClick={handleScanAll}
            disabled={
              loading || scanning
            }
          >
            <span>⚡</span>
            {scanning
              ? "Scanning..."
              : "Scan Websites"}
          </button>

        </div>

      </section>

      {/* =====================================================
          ❌ ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="dashboard-alert dashboard-alert-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* =====================================================
          ✅ SUCCESS MESSAGE
      ===================================================== */}

      {scanMessage && (
        <div className="dashboard-alert dashboard-alert-success">
          <span>✓</span>
          {scanMessage}
        </div>
      )}

      {/* =====================================================
          📊 STATISTICS
      ===================================================== */}

      <section className="dashboard-stats">

        <div className="stat-card stat-card-blue">
          <div className="stat-card-top">
            <div className="stat-icon">
              🌐
            </div>

            <span className="stat-label">
              WEBSITES
            </span>
          </div>

          <div className="stat-value">
            {websites.length}
          </div>

          <div className="stat-description">
            Websites under monitoring
          </div>

          <div className="stat-glow"></div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-card-top">
            <div className="stat-icon">
              🔗
            </div>

            <span className="stat-label">
              TOTAL ERRORS
            </span>
          </div>

          <div className="stat-value">
            {total404Errors}
          </div>

          <div className="stat-description">
            404 errors detected
          </div>

          <div className="stat-glow"></div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-top">
            <div className="stat-icon">
              ✓
            </div>

            <span className="stat-label">
              RECOVERED
            </span>
          </div>

          <div className="stat-value">
            {recoveredErrors}
          </div>

          <div className="stat-description">
            Successfully recovered
          </div>

          <div className="stat-glow"></div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-card-top">
            <div className="stat-icon">
              !
            </div>

            <span className="stat-label">
              ACTIVE
            </span>
          </div>

          <div className="stat-value">
            {activeErrors}
          </div>

          <div className="stat-description">
            Errors requiring attention
          </div>

          <div className="stat-glow"></div>
        </div>

      </section>

      {/* =====================================================
          🕐 LAST SCAN
      ===================================================== */}

      <section className="last-scan-banner">

        <div className="last-scan-icon">
          🕐
        </div>

        <div className="last-scan-content">
          <span>
            LAST SYSTEM SCAN
          </span>

          <strong>
            {lastScan
              ? new Date(
                  lastScan
                ).toLocaleString()
              : "Not scanned yet"}
          </strong>
        </div>

        <div className="last-scan-status">
          <span></span>
          System Ready
        </div>

      </section>

      {/* =====================================================
          🌐 WEBSITES
      ===================================================== */}

      <section className="dashboard-panel">

        <div className="panel-header">

          <div>
            <div className="panel-title-row">
              <div className="panel-title-icon">
                🌐
              </div>

              <h2>
                Monitored Websites
              </h2>
            </div>

            <p>
              Manage the websites currently
              being monitored by 404Watch.
            </p>
          </div>

          <span className="panel-count">
            {websites.length}{" "}
            {websites.length === 1
              ? "website"
              : "websites"}
          </span>

        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            Loading websites...
          </div>
        ) : websites.length === 0 ? (
          <div className="dashboard-empty-state">

            <div className="empty-icon">
              🌐
            </div>

            <h3>
              No websites yet
            </h3>

            <p>
              Add your first website to start
              monitoring broken links.
            </p>

            <Link
              to="/website"
              className="primary-action"
            >
              + Add Website
            </Link>

          </div>
        ) : (
          <div className="website-list">

            {websites.map(
              (website) => (
                <div
                  className="website-item"
                  key={website.id}
                >

                  <div className="website-info">

                    <div className="website-icon">
                      🌐
                    </div>

                    <div className="website-details">

                      <h3>
                        {website.url}
                      </h3>

                      <span
                        className={
                          website.monitoringEnabled
                            ? "monitoring-status monitoring-enabled"
                            : "monitoring-status monitoring-disabled"
                        }
                      >
                        <span className="status-dot"></span>

                        {website.monitoringEnabled
                          ? "Monitoring Enabled"
                          : "Monitoring Disabled"}
                      </span>

                    </div>

                  </div>

                  <div className="website-actions">

                    <Link
                      to={`/website/${website.id}`}
                      className="website-view-button"
                    >
                      View
                      <span>→</span>
                    </Link>

                    <button
                      type="button"
                      className="website-delete-button"
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
              )
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          🚨 BROKEN URLS
      ===================================================== */}

      <section className="dashboard-panel">

        <div className="panel-header">

          <div>
            <div className="panel-title-row">

              <div className="panel-title-icon panel-title-icon-danger">
                🔗
              </div>

              <h2>
                Broken URLs
              </h2>

            </div>

            <p>
              Track active and recovered
              broken links across your websites.
            </p>
          </div>

          <span className="panel-count panel-count-danger">
            {total404Errors} total
          </span>

        </div>

        {/* FILTERS */}

        <div className="error-filters">

          <button
            type="button"
            className={
              errorFilter === "all"
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setErrorFilter("all")
            }
          >
            All
            <span>
              {allErrorCount}
            </span>
          </button>

          <button
            type="button"
            className={
              errorFilter === "active"
                ? "filter-button active filter-active"
                : "filter-button"
            }
            onClick={() =>
              setErrorFilter("active")
            }
          >
            Active
            <span>
              {activeErrorCount}
            </span>
          </button>

          <button
            type="button"
            className={
              errorFilter === "recovered"
                ? "filter-button active filter-recovered"
                : "filter-button"
            }
            onClick={() =>
              setErrorFilter("recovered")
            }
          >
            Recovered
            <span>
              {recoveredErrorCount}
            </span>
          </button>

        </div>

        {!loading &&
          errors.length > 0 && (
            <div className="filtered-results-count">
              Showing{" "}
              <strong>
                {filteredErrors.length}
              </strong>{" "}
              result
              {filteredErrors.length === 1
                ? ""
                : "s"}
            </div>
          )}

        {loading ? (
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            Loading broken URLs...
          </div>
        ) : errors.length === 0 ? (
          <div className="dashboard-empty-state dashboard-success-empty">

            <div className="empty-icon empty-icon-success">
              ✓
            </div>

            <h3>
              Everything looks good
            </h3>

            <p>
              No broken URLs have been detected.
              Your monitored websites are healthy.
            </p>

          </div>
        ) : filteredErrors.length === 0 ? (
          <div className="dashboard-empty-state">

            <div className="empty-icon">
              🔎
            </div>

            <h3>
              No matching errors
            </h3>

            <p>
              There are no errors matching
              the selected filter.
            </p>

          </div>
        ) : (
          <>
            <div className="error-list">

              {filteredErrors.map(
                (errorItem) => {

                  const recovered =
                    isRecoveredError(
                      errorItem
                    );

                  return (
                    <div
                      className={
                        recovered
                          ? "error-item error-item-recovered"
                          : "error-item error-item-active"
                      }
                      key={errorItem.id}
                    >

                      <div className="error-item-header">

                        <div className="error-url">

                          <span className="error-url-icon">
                            {recovered
                              ? "✓"
                              : "!"}
                          </span>

                          <h3>
                            {errorItem.url}
                          </h3>

                        </div>

                        <span
                          className={
                            recovered
                              ? "error-status error-status-recovered"
                              : "error-status error-status-active"
                          }
                        >
                          {recovered
                            ? "Recovered"
                            : "Active"}
                        </span>

                      </div>

                      <div className="error-details">

                        <div className="error-detail">
                          <span>
                            WEBSITE
                          </span>

                          <strong>
                            {errorItem.website?.url ||
                              "Unknown"}
                          </strong>
                        </div>

                        <div className="error-detail">
                          <span>
                            SOURCE PAGE
                          </span>

                          <strong>
                            {errorItem.sourceUrl ||
                              "Unknown"}
                          </strong>
                        </div>

                        <div className="error-detail">
                          <span>
                            STATUS
                          </span>

                          <strong
                            className={
                              recovered
                                ? "http-badge http-recovered"
                                : "http-badge http-error"
                            }
                          >
                            {recovered
                              ? "Recovered"
                              : errorItem.status}
                          </strong>
                        </div>

                        <div className="error-detail">
                          <span>
                            DETECTED
                          </span>

                          <strong>
                            {errorItem.detectedAt
                              ? new Date(
                                  errorItem.detectedAt
                                ).toLocaleString()
                              : "Unknown"}
                          </strong>
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {errorTotalPages > 1 && (
              <div className="error-pagination">

                <button
                  type="button"
                  onClick={
                    handlePreviousErrorPage
                  }
                  disabled={
                    errorPage === 1
                  }
                >
                  ← Previous
                </button>

                <div>
                  Page{" "}
                  <strong>
                    {errorPage}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {errorTotalPages}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={
                    handleNextErrorPage
                  }
                  disabled={
                    errorPage ===
                    errorTotalPages
                  }
                >
                  Next →
                </button>

              </div>
            )}
          </>
        )}

      </section>

      {/* =====================================================
          🔗 QUICK ACTIONS
      ===================================================== */}

      <section className="quick-actions">

        <Link
          to="/website"
          className="quick-action quick-action-blue"
        >
          <span className="quick-action-icon">
            +
          </span>

          <span>
            <strong>
              Add Website
            </strong>

            <small>
              Start monitoring a new website
            </small>
          </span>

          <span className="quick-arrow">
            →
          </span>
        </Link>

        <Link
          to="/billing"
          className="quick-action quick-action-purple"
        >
          <span className="quick-action-icon">
            $
          </span>

          <span>
            <strong>
              Billing
            </strong>

            <small>
              Manage your subscription
            </small>
          </span>

          <span className="quick-arrow">
            →
          </span>
        </Link>

      </section>

    </div>
  );
}

export default Dashboard;
