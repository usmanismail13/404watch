import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

function Website() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const isDetailPage = Boolean(id);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchWebsite = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/api/websites/${id}`);

        setWebsite(response.data.website);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch website"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!url.trim()) {
      setError("Website URL is required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/websites", {
        url: url.trim(),
      });

      const newWebsite = response.data.website;

      navigate(`/website/${newWebsite.id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add website"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMonitoringToggle = async () => {
    if (!website) {
      return;
    }

    try {
      setMonitoringLoading(true);
      setError("");

      const response = await api.patch(
        `/api/websites/${website.id}/monitoring`,
        {
          monitoringEnabled: !website.monitoringEnabled,
        }
      );

      setWebsite(response.data.website);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update monitoring status"
      );
    } finally {
      setMonitoringLoading(false);
    }
  };

  const handleScan = async () => {
    if (!website) {
      return;
    }

    try {
      setScanLoading(true);
      setError("");
      setScanResult(null);

      const response = await api.post(
        `/api/scans/${website.id}`
      );

      setScanResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to scan website"
      );
    } finally {
      setScanLoading(false);
    }
  };

  if (isDetailPage) {
    if (loading) {
      return (
        <div className="website-page">
          <div className="website-container">
            <div className="website-loading-card">
              <div className="website-loading-icon">⏳</div>
              <h2>Loading website...</h2>
              <p>Please wait while we load your website details.</p>
            </div>
          </div>
        </div>
      );
    }

    if (error && !website) {
      return (
        <div className="website-page">
          <div className="website-container">
            <div className="website-error-card">
              <div className="website-error-icon">⚠️</div>
              <h1>Website</h1>
              <p>{error}</p>

              <button
                type="button"
                className="website-secondary-button"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!website) {
      return (
        <div className="website-page">
          <div className="website-container">
            <div className="website-error-card">
              <div className="website-error-icon">🔍</div>
              <h1>Website Not Found</h1>
              <p>
                The website you're looking for could not be found.
              </p>

              <button
                type="button"
                className="website-secondary-button"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="website-page">
        <div className="website-container">
          <div className="website-header">
            <div>
              <p className="website-eyebrow">
                404Watch Website
              </p>

              <h1>🌐 Website Details</h1>

              <p className="website-header-description">
                Manage monitoring and scan your website for broken
                links.
              </p>
            </div>

            <button
              type="button"
              className="website-back-button"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="website-main-card">
            <div className="website-info-section">
              <div className="website-icon">🌐</div>

              <div className="website-info">
                <span className="website-info-label">
                  Monitored Website
                </span>

                <h2>{website.url}</h2>

                <div
                  className={
                    website.monitoringEnabled
                      ? "website-status active"
                      : "website-status paused"
                  }
                >
                  <span className="website-status-dot">
                    {website.monitoringEnabled ? "●" : "●"}
                  </span>

                  {website.monitoringEnabled
                    ? "Monitoring Active"
                    : "Monitoring Paused"}
                </div>
              </div>
            </div>

            <div className="website-actions">
              <button
                type="button"
                className={
                  website.monitoringEnabled
                    ? "website-pause-button"
                    : "website-enable-button"
                }
                onClick={handleMonitoringToggle}
                disabled={monitoringLoading}
              >
                {monitoringLoading
                  ? "⏳ Updating..."
                  : website.monitoringEnabled
                    ? "⏸️ Pause Monitoring"
                    : "▶️ Enable Monitoring"}
              </button>

              <button
                type="button"
                className="website-scan-button"
                onClick={handleScan}
                disabled={
                  scanLoading ||
                  !website.monitoringEnabled
                }
              >
                {scanLoading
                  ? "🔍 Scanning..."
                  : "🔍 Scan Website"}
              </button>
            </div>
          </div>

          {!website.monitoringEnabled && (
            <div className="website-notice">
              <span>💡</span>

              <div>
                <strong>Monitoring is paused</strong>
                <p>
                  Enable monitoring before starting a website
                  scan.
                </p>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="scan-result-card">
              <div className="scan-result-header">
                <div>
                  <p className="website-eyebrow">
                    Latest Scan
                  </p>

                  <h2>🔍 Scan Results</h2>
                </div>

                <span className="scan-complete-badge">
                  ✓ Complete
                </span>
              </div>

              <div className="scan-stat-grid">
                <div className="scan-stat">
                  <span className="scan-stat-icon">🔗</span>

                  <span className="scan-stat-label">
                    Links Checked
                  </span>

                  <strong>
                    {scanResult.linksChecked}
                  </strong>
                </div>

                <div className="scan-stat">
                  <span className="scan-stat-icon error">
                    🚨
                  </span>

                  <span className="scan-stat-label">
                    404 Errors
                  </span>

                  <strong className={
                    scanResult.errorsFound > 0
                      ? "has-errors"
                      : "no-errors"
                  }>
                    {scanResult.errorsFound}
                  </strong>
                </div>
              </div>

              {scanResult.errorsFound > 0 ? (
                <div className="broken-links-section">
                  <div className="broken-links-header">
                    <h3>🚨 Broken Links</h3>

                    <span>
                      {scanResult.errorsFound} found
                    </span>
                  </div>

                  <div className="broken-links-list">
                    {scanResult.errors.map((item, index) => (
                      <div
                        className="broken-link-card"
                        key={`${item.url}-${index}`}
                      >
                        <div className="broken-link-top">
                          <span className="broken-link-number">
                            {index + 1}
                          </span>

                          <span className="broken-link-status">
                            HTTP {item.status}
                          </span>
                        </div>

                        <div className="broken-link-field">
                          <span>🔗 Broken URL</span>
                          <strong>{item.url}</strong>
                        </div>

                        <div className="broken-link-field">
                          <span>📄 Source Page</span>
                          <strong>
                            {item.sourceUrl}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="scan-success">
                  <div className="scan-success-icon">
                    ✓
                  </div>

                  <div>
                    <h3>🎉 No 404 errors found</h3>

                    <p>
                      Great! Your website currently has no
                      detected broken links.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!scanResult && (
            <div className="website-empty-state">
              <div className="website-empty-icon">🔍</div>

              <h2>Ready to scan?</h2>

              <p>
                Run a scan to find broken links and HTTP 404
                errors on this website.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="website-page">
      <div className="website-container website-add-container">
        <div className="website-add-card">
          <div className="website-add-icon">🌐</div>

          <p className="website-eyebrow">
            404Watch Monitoring
          </p>

          <h1>Add Website</h1>

          <p className="website-add-description">
            Enter the website URL you want 404Watch to monitor
            for broken links and 404 errors.
          </p>

          <form
            className="website-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="url">
              Website URL
            </label>

            <input
              id="url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="website-submit-button"
              disabled={loading}
            >
              {loading
                ? "⏳ Adding Website..."
                : "➕ Add Website"}
            </button>
          </form>

          <button
            type="button"
            className="website-text-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Website;
