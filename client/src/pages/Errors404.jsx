import { useCallback, useEffect, useState } from "react";
import api from "../api";

function Errors404() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchErrors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/errors");

      setErrors(response.data.errors || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch 404 errors"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  return (
    <div>
      <h1>404 Errors</h1>

      <p>Monitor and manage your website's broken links.</p>

      <button
        type="button"
        onClick={fetchErrors}
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading 404 errors...</p>
      ) : errors.length === 0 ? (
        <p>No 404 errors detected yet.</p>
      ) : (
        <div>
          {errors.map((item) => (
            <div key={item.id}>
              <h3>{item.url}</h3>

              <p>
                <strong>Website:</strong>{" "}
                {item.website?.url || "Unknown"}
              </p>

              <p>
                <strong>Source:</strong>{" "}
                {item.sourceUrl || "Unknown"}
              </p>

              <p>
                <strong>Status:</strong> {item.status}
              </p>

              <p>
                <strong>Detected:</strong>{" "}
                {new Date(item.detectedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Errors404;