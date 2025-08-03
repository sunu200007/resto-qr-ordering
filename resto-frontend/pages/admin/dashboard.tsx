import { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardDapur() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = "Bearer "; // ganti dengan tokenmu

  const fetchOrders = () => {
    axios
      .get("https://8000/order/dapur", {
        headers: { Authorization: token },
      })
      .then((res) => {
        setOrders(res.data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal ambil data pesanan:", err);
        setLoading(false);
      });
  };

  const updateStatus = async (order_id: string, status: string) => {
    try {
      await axios.post(
        "https://8000/order/update-status",
        { order_id, status },
        { headers: { Authorization: token } }
      );
      fetchOrders();
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📦 Dashboard Dapur</h1>

      {loading ? (
        <p>Memuat pesanan...</p>
      ) : orders.length === 0 ? (
        <p>Tidak ada pesanan masuk.</p>
      ) : (
        <div style={styles.grid}>
          {orders.map((order: any) => (
            <div key={order.order_id} style={styles.card}>
              <h2 style={{ marginBottom: 5 }}>
                Meja #{order.table_number}
              </h2>
              <p style={{ fontSize: 12, color: "#666" }}>
                Dibuat: {new Date(order.created_at).toLocaleString("id-ID")}
                </p>


              <div style={styles.status(order.payment_status)}>
                Status: {order.payment_status}
              </div>

              <ul style={{ margin: "10px 0" }}>
                {order.items.map((item: any, i: number) => (
                  <li key={i}>
                    🍽 {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p><b>Catatan:</b> {order.notes}</p>
              )}

              {order.payment_status !== "done" && (
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => updateStatus(order.order_id, "processing")}
                    style={styles.btnBlue}
                  >
                    Proses
                  </button>
                  <button
                    onClick={() => updateStatus(order.order_id, "done")}
                    style={styles.btnGreen}
                  >
                    Selesai
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Simple inline CSS styling
const styles: any = {
  container: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f7f7f7",
  },
  heading: {
    fontSize: 28,
    marginBottom: 20,
    color: "#333",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderLeft: "6px solid #ff9800",
  },
  status: (status: string) => ({
    padding: "4px 10px",
    backgroundColor:
      status === "done"
        ? "#4caf50"
        : status === "processing"
        ? "#2196f3"
        : "#ffeb3b",
    color: status === "pending" ? "#333" : "#fff",
    fontWeight: "bold",
    borderRadius: 5,
    display: "inline-block",
    marginBottom: 8,
    fontSize: 14,
  }),
  buttonGroup: {
    marginTop: 10,
    display: "flex",
    gap: 10,
  },
  btnBlue: {
    backgroundColor: "#2196f3",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  btnGreen: {
    backgroundColor: "#4caf50",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};
