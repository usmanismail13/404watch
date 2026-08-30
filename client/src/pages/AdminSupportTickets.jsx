import { useEffect, useState } from "react";

function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTicketId, setUpdatingTicketId] = useState(null);

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

  async function markAsPending(ticketId) {
    try {
      setUpdatingTicketId(ticketId);

      const response = await fetch(
        `http://localhost:5000/api/admin/support-tickets/${ticketId}/pending`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update ticket");
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.ticketId === ticketId
            ? { ...ticket, status: "pending" }
            : ticket
        )
      );

      setSelectedTicket((currentTicket) =>
        currentTicket && currentTicket.ticketId === ticketId
          ? { ...currentTicket, status: "pending" }
          : currentTicket
      );
    } catch (err) {
      console.error("Failed to mark ticket as pending:", err);
      setError("Failed to mark ticket as pending.");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  async function markAsResolved(ticketId) {
    try {
      setUpdatingTicketId(ticketId);

      const response = await fetch(
        `http://localhost:5000/api/admin/support-tickets/${ticketId}/resolved`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resolve ticket");
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.ticketId === ticketId
            ? { ...ticket, status: "resolved" }
            : ticket
        )
      );

      setSelectedTicket((currentTicket) =>
        currentTicket && currentTicket.ticketId === ticketId
          ? { ...currentTicket, status: "resolved" }
          : currentTicket
      );
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
      setError("Failed to resolve ticket.");
    } finally {
      setUpdatingTicketId(null);
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

                  <td>
                    {ticket.status === "pending"
                      ? "🟡 Pending"
                      : ticket.status === "resolved"
                      ? "✅ Resolved"
                      : "🟢 Open"}
                  </td>

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

                    {ticket.status === "open" && (
                      <button
                        type="button"
                        onClick={() => markAsPending(ticket.ticketId)}
                        disabled={updatingTicketId === ticket.ticketId}
                      >
                        {updatingTicketId === ticket.ticketId
                          ? "⏳ Updating..."
                          : "🟡 Mark Pending"}
                      </button>
                    )}

                    {ticket.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => markAsResolved(ticket.ticketId)}
                        disabled={updatingTicketId === ticket.ticketId}
                      >
                        {updatingTicketId === ticket.ticketId
                          ? "⏳ Updating..."
                          : "✅ Mark Resolved"}
                      </button>
                    )}
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
            {selectedTicket.status === "pending"
              ? "🟡 Pending"
              : selectedTicket.status === "resolved"
              ? "✅ Resolved"
              : "🟢 Open"}
          </p>

          <p>
            <strong>💬 Message:</strong>
          </p>

          <p>{selectedTicket.message}</p>

          <p>
            <strong>📅 Created:</strong>{" "}
            {new Date(selectedTicket.createdAt).toLocaleString()}
          </p>

          {selectedTicket.status === "open" && (
            <button
              type="button"
              onClick={() => markAsPending(selectedTicket.ticketId)}
              disabled={
                updatingTicketId === selectedTicket.ticketId
              }
            >
              {updatingTicketId === selectedTicket.ticketId
                ? "⏳ Updating..."
                : "🟡 Mark Pending"}
            </button>
          )}

          {selectedTicket.status === "pending" && (
            <button
              type="button"
              onClick={() => markAsResolved(selectedTicket.ticketId)}
              disabled={
                updatingTicketId === selectedTicket.ticketId
              }
            >
              {updatingTicketId === selectedTicket.ticketId
                ? "⏳ Updating..."
                : "✅ Mark Resolved"}
            </button>
          )}

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
