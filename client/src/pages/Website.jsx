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
      return <p>Loading website...</p>;
    }

    if (error && !website) {
      return (
        <div>
          <h1>Website</h1>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      );
    }

    if (!website) {
      return <p>Website not found.</p>;
    }

    return (
      <div>
        <h1>Website Details</h1>

        <p>
          <strong>URL:</strong> {website.url}
        </p>

        <p>
          <strong>Monitoring:</strong>{" "}
          {website.monitoringEnabled ? "Enabled" : "Disabled"}
        </p>

        <button
          type="button"
          onClick={handleMonitoringToggle}
          disabled={monitoringLoading}
        >
          {monitoringLoading
            ? "Updating..."
            : website.monitoringEnabled
              ? "Disable Monitoring"
              : "Enable Monitoring"}
        </button>

        <br />
        <br />

        <button
          type="button"
          onClick={handleScan}
          disabled={scanLoading || !website.monitoringEnabled}
        >
          {scanLoading ? "Scanning..." : "Scan Website"}
        </button>

        {!website.monitoringEnabled && (
          <p>
            Enable monitoring before starting a scan.
          </p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {scanResult && (
          <div>
            <h2>Scan Complete</h2>

            <p>
              <strong>Links checked:</strong>{" "}
              {scanResult.linksChecked}
            </p>

            <p>
              <strong>404 errors found:</strong>{" "}
              {scanResult.errorsFound}
            </p>

            {scanResult.errorsFound > 0 && (
              <div>
                <h3>Broken Links</h3>

                {scanResult.errors.map((item, index) => (
                  <div key={`${item.url}-${index}`}>
                    <p>
                      <strong>Broken URL:</strong>{" "}
                      {item.url}
                    </p>

                    <p>
                      <strong>Source:</strong>{" "}
                      {item.sourceUrl}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {item.status}
                    </p>

                    <hr />
                  </div>
                ))}
              </div>
            )}

            {scanResult.errorsFound === 0 && (
              <p>No 404 errors were found.</p>
            )}
          </div>
        )}

        <br />

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Add Website</h1>

      <p>
        Enter the website URL you want 404Watch to monitor.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="url">Website URL</label>

          <input
            id="url"
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Website"}
        </button>
      </form>
    </div>
  );
}

export default Website;