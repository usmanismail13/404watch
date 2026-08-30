import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Feedback from "../components/Feedback";
import Loading from "../components/Loading.jsx";

function Website() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [url, setUrl] = useState("");
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const [feedback, setFeedback] = useState(
    location.state?.feedback || {
      type: "",
      message: "",
    }
  );

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

  useEffect(() => {
    if (location.state?.feedback) {
      setFeedback(location.state.feedback);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setFeedback({
      type: "",
      message: "",
    });

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

      navigate(`/website/${newWebsite.id}`, {
        state: {
          feedback: {
            type: "success",
            message: "Website added successfully!",
          },
        },
      });
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

      setFeedback({
        type: "",
        message: "",
      });

      const response = await api.patch(
        `/api/websites/${website.id}/monitoring`,
        {
          monitoringEnabled: !website.monitoringEnabled,
        }
      );

      setWebsite(response.data.website);

      setFeedback({
        type: response.data.website.monitoringEnabled
          ? "success"
          : "confirmation",
        message: response.data.website.monitoringEnabled
          ? "Website monitoring enabled successfully!"
          : "🔔 Website monitoring has been paused.",
      });
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

      setFeedback({
        type: "",
        message: "",
      });

      setScanResult(null);

      const response = await api.post(
        `/api/scans/${website.id}`
      );

      setScanResult(response.data);

      setFeedback({
        type: "success",
        message: "Website scan completed successfully!",
      });
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
            <Loading text="Loading website..." />
          </div>
        </div>
      );
    }

    if (error && !website) {
      return (
        <div className="website-page">
          <div className="website-container">
            <ErrorState
              icon="⚠️"
              title="Unable to Load Website"
              message={error}
              action={
                <button
                  type="button"
                  className="website-secondary-button"
                  onClick={() => navigate("/dashboard")}
                  aria-label="Go back to dashboard"
                >
                  ← Back to Dashboard
                </button>
              }
            />
          </div>
        </div>
      );
    }

    if (!website) {
      return (
        <div className="website-page">
          <div className="website-container">
            <EmptyState
              icon="🔍"
              title="Website Not Found"
              message="The website you're looking for could not be found."
              action={
                <button
                  type="button"
                  className="website-secondary-button"
                  onClick={() => navigate("/dashboard")}
                  aria-label="Go back to dashboard"
                >
                  ← Back to Dashboard
                </button>
              }
            />
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
              aria-label="Go back to dashboard"
            >
              ← Dashboard
            </button>
          </div>

          {feedback.message && (
            <Feedback
              type={feedback.type}
              message={feedback.message}
              onClose={() =>
                setFeedback({
                  type: "",
                  message: "",
                })
              }
            />
          )}

          {error && (
            <div
              className="alert alert-error"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <div className="website-main-card">
            <div className="website-info-section">
              <div
                className="website-icon"
                aria-hidden="true"
              >
                🌐
              </div>

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
                  role="status"
                  aria-label={
                    website.monitoringEnabled
                      ? "Monitoring active"
                      : "Monitoring paused"
                  }
                >
                  <span
                    className="website-status-dot"
                    aria-hidden="true"
                  >
                    ●
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
                aria-busy={monitoringLoading}
                aria-label={
                  monitoringLoading
                    ? "Updating monitoring status"
                    : website.monitoringEnabled
                      ? "Pause website monitoring"
                      : "Enable website monitoring"
                }
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
                aria-busy={scanLoading}
                aria-label={
                  scanLoading
                    ? "Scanning website"
                    : "Scan website for broken links"
                }
              >
                {scanLoading
                  ? "🔍 Scanning..."
                  : "🔍 Scan Website"}
              </button>
            </div>
          </div>

          {!website.monitoringEnabled && (
            <div
              className="website-notice"
              role="status"
            >
              <span aria-hidden="true">💡</span>

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
            <div
              className="scan-result-card"
              aria-labelledby="scan-results-title"
            >
              <div className="scan-result-header">
                <div>
                  <p className="website-eyebrow">
                    Latest Scan
                  </p>

                  <h2 id="scan-results-title">
                    🔍 Scan Results
                  </h2>
                </div>

                <span
                  className="scan-complete-badge"
                  role="status"
                >
                  ✓ Complete
                </span>
              </div>

              <div className="scan-stat-grid">
                <div className="scan-stat">
                  <span
                    className="scan-stat-icon"
                    aria-hidden="true"
                  >
                    🔗
                  </span>

                  <span className="scan-stat-label">
                    Links Checked
                  </span>

                  <strong>
                    {scanResult.linksChecked}
                  </strong>
                </div>

                <div className="scan-stat">
                  <span
                    className="scan-stat-icon error"
                    aria-hidden="true"
                  >
                    🚨
                  </span>

                  <span className="scan-stat-label">
                    404 Errors
                  </span>

                  <strong
                    className={
                      scanResult.errorsFound > 0
                        ? "has-errors"
                        : "no-errors"
                    }
                  >
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

                  <div
                    className="broken-links-list"
                    aria-label="Broken links"
                  >
                    {scanResult.errors.map((item, index) => (
                      <div
                        className="broken-link-card"
                        key={`${item.url}-${index}`}
                      >
                        <div className="broken-link-top">
                          <span className="broken-link-number">
                            {index + 1}
                          </span>

                          <span
                            className="broken-link-status"
                            role="status"
                          >
                            HTTP {item.status}
                          </span>
                        </div>

                        <div className="broken-link-field">
                          <span>🔗 Broken URL</span>

                          <strong>
                            {item.url}
                          </strong>
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
                <EmptyState
                  icon="🎉"
                  title="No 404 Errors Found"
                  message="Great! Your website currently has no detected broken links."
                />
              )}
            </div>
          )}

          {!scanResult && (
            <EmptyState
              icon="🔍"
              title="Ready to Scan?"
              message="Run a scan to find broken links and HTTP 404 errors on this website."
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="website-page">
      <div className="website-container website-add-container">
        <div className="website-add-card">
          <div
            className="website-add-icon"
            aria-hidden="true"
          >
            🌐
          </div>

          <p className="website-eyebrow">
            404Watch Monitoring
          </p>

          <h1>Add Website</h1>

          <p
            className="website-add-description"
            id="website-form-description"
          >
            Enter the website URL you want 404Watch to monitor
            for broken links and 404 errors.
          </p>

          <form
            className="website-form"
            onSubmit={handleSubmit}
            aria-describedby="website-form-description"
          >
            <label htmlFor="url">
              Website URL
            </label>

            <input
              id="url"
              name="url"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              required
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "website-form-description website-url-error"
                  : "website-form-description"
              }
            />

            {error && (
              <div
                className="alert alert-error"
                id="website-url-error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="website-submit-button"
              disabled={loading}
              aria-busy={loading}
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
            aria-label="Go back to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Website;
