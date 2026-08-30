import { useEffect, useState } from "react";

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/support-tickets",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load support tickets");
      }

      const data = await response.json();

      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to load support tickets:", err);
      setError("Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>⏳ Loading support tickets...</div>;
  }

  if (error) {
    return (
      <div>
        <p>❌ {error}</p>

        <button type="button" onClick={fetchTickets}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>🆘 Support Tickets</h1>

      <p>📩 Manage customer support requests.</p>

      <button type="button" onClick={fetchTickets}>
        🔄 Refresh Tickets
      </button>

      <div>
        <h2>🎫 Tickets</h2>

        {tickets.length === 0 ? (
          <p>📭 No support tickets found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>🎫 Ticket ID</th>
                <th>👤 Customer</th>
                <th>📝 Subject</th>
                <th>🟢 Status</th>
                <th>📅 Created</th>
                <th>👁️ Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticketId}</td>

                  <td>{ticket.user?.email || "—"}</td>

                  <td>{ticket.subject}</td>

                  <td>{ticket.status}</td>

                  <td>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedTicket && (
        <div>
          <h2>🎫 Ticket Details</h2>

          <p>
            <strong>🆔 Ticket ID:</strong>{" "}
            {selectedTicket.ticketId}
          </p>

          <p>
            <strong>👤 Customer:</strong>{" "}
            {selectedTicket.user?.email || "—"}
          </p>

          <p>
            <strong>📝 Subject:</strong>{" "}
            {selectedTicket.subject}
          </p>

          <p>
            <strong>🟢 Status:</strong>{" "}
            {selectedTicket.status}
          </p>

          <p>
            <strong>💬 Message:</strong>
          </p>

          <p>{selectedTicket.message}</p>

          <p>
            <strong>📅 Created:</strong>{" "}
            {new Date(selectedTicket.createdAt).toLocaleString()}
          </p>

          <button
            type="button"
            onClick={() => setSelectedTicket(null)}
          >
            ❌ Close
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminSupportTickets;
