import { useCallback, useEffect, useState } from "react";
import api from "../api";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loading from "../components/Loading.jsx";

function Errors404() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const activeErrors = errors.filter(
    (item) => item.status === "active"
  ).length;

  const recoveredErrors = errors.filter(
    (item) => item.status === "recovered"
  ).length;

  const totalErrors = errors.length;

  const filteredErrors = errors.filter((item) => {
    const searchTerm = search.toLowerCase();

    const matchesSearch =
      item.url?.toLowerCase().includes(searchTerm) ||
      item.sourceUrl?.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasFilters =
    search.trim() !== "" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span
          style={{
            display: "inline-block",
            padding: "5px 12px",
            borderRadius: "999px",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            fontWeight: "600",
            fontSize: "13px",
          }}
        >
          🔴 Active
        </span>
      );
    }

    if (status === "recovered") {
      return (
        <span
          style={{
            display: "inline-block",
            padding: "5px 12px",
            borderRadius: "999px",
            backgroundColor: "#dcfce7",
            color: "#15803d",
            fontWeight: "600",
            fontSize: "13px",
          }}
        >
          🟢 Recovered
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-block",
          padding: "5px 12px",
          borderRadius: "999px",
          backgroundColor: "#e5e7eb",
          color: "#374151",
          fontWeight: "600",
          fontSize: "13px",
        }}
      >
        ⚪ {status}
      </span>
    );
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 20px",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          marginBottom: "28px",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "32px",
          }}
        >
          🚨 404 Errors
        </h1>

        <p
          style={{
            margin: 0,
            color: "#6b7280",
          }}
        >
          Monitor and manage your website's broken links.
        </p>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "20px",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            backgroundColor: "#fef2f2",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              color: "#991b1b",
              fontWeight: "600",
            }}
          >
            🔴 Active Errors
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#b91c1c",
            }}
          >
            {activeErrors}
          </h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            backgroundColor: "#f0fdf4",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              color: "#166534",
              fontWeight: "600",
            }}
          >
            🟢 Recovered Errors
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#15803d",
            }}
          >
            {recoveredErrors}
          </h2>
        </div>

        <div
          style={{
            padding: "20px",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            backgroundColor: "#f9fafb",
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              color: "#374151",
              fontWeight: "600",
            }}
          >
            📊 Total Errors
          </p>

          <h2
            style={{
              margin: 0,
              fontSize: "28px",
              color: "#111827",
            }}
          >
            {totalErrors}
          </h2>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search broken URLs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1",
            minWidth: "220px",
            padding: "11px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "11px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            backgroundColor: "#fff",
            fontSize: "14px",
          }}
        >
          <option value="all">🔵 All Status</option>
          <option value="active">🔴 Active</option>
          <option value="recovered">🟢 Recovered</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            style={{
              padding: "11px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              backgroundColor: "#fff",
              cursor: "pointer",
            }}
          >
            ❌ Clear Filters
          </button>
        )}

        <button
          type="button"
          onClick={fetchErrors}
          disabled={loading}
          style={{
            padding: "11px 14px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#111827",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "🔄 Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Loading 404 errors..." />
      ) : error ? (
        <ErrorState
          title="❌ Unable to Load 404 Errors"
          message={error}
          action={
            <button
              type="button"
              onClick={fetchErrors}
              disabled={loading}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#111827",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              🔄 Try Again
            </button>
          }
        />
      ) : filteredErrors.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="No Matching Errors"
            message="No 404 errors match your current search or status filter."
            action={
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#111827",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                🔄 Clear Filters
              </button>
            }
          />
        ) : (
          <EmptyState
            title="🎉 No 404 Errors"
            message="Great news! No broken links have been detected on your website yet."
            action={
              <button
                type="button"
                onClick={fetchErrors}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#111827",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                🔄 Check Again
              </button>
            }
          />
        )
      ) : (
        <div>
          {filteredErrors.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "14px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    🔗 BROKEN URL
                  </p>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      wordBreak: "break-all",
                      fontWeight: "600",
                    }}
                  >
                    {item.url}
                  </a>
                </div>

                <div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>🌐 Website:</strong>{" "}
                  {item.website?.url ? (
                    <a
                      href={item.website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.website.url}
                    </a>
                  ) : (
                    "Unknown"
                  )}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>📄 Source Page:</strong>{" "}
                  {item.sourceUrl ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#2563eb",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.sourceUrl}
                    </a>
                  ) : (
                    "Unknown"
                  )}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>🕐 Detected:</strong>{" "}
                  {new Date(item.detectedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Errors404;
