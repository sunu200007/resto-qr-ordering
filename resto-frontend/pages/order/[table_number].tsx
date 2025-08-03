import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function OrderPage() {
  const router = useRouter();
  const { table_number } = router.query;

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);
  const [notes, setNotes] = useState("");
  const [qrisUrl, setQrisUrl] = useState("");

  const token = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Nsb3VkLmdvb2dsZS5jb20vd29ya3N0YXRpb25zIiwiYXVkIjoiZmlyZWJhc2UtcmVzdG8tMTc1NDIxOTY3NjYzNi5jbHVzdGVyLTQ0a3gyZWlvY2JoZTJ0eWszem95bzNyeXVvLmNsb3Vkd29ya3N0YXRpb25zLmRldiIsImlhdCI6MTc1NDIyMDA3OSwiZXhwIjoxNzU0MzA2NDc5fQ.Lb3bcsIpPoFIdyrYQuL_zF5tVS8qDigK5Nvb5sLxzXNt5BNPeQ7cJPUDqBGIx6vsQ1PIADKByUtr0-6ilwO7I8Vbz_u3JhK9QKacbubML-xQ006X9gnBrDsLB7r1CjOG9m_s44eLpG5LORWJYR-_Z4IZvVJwY_QQkuQX276_q6KEkprZmZJvlLH6DXXIYto61XYrT_1kvzxFvkBFy-YCQY82rOe1X0OrvyJ3YQpXfwgj_-dCfPjAQ9eoCBIgNK3Vc8Wg3pXM21CX7HZ5oEfOyfL3K5uTCnChEmCLbiw5PzQ2OFB4UzEoYPW23ZOtR0tX1V2wMZu-gQt9dYRPW_lmeQ"; // ganti dengan token kamu

  useEffect(() => {
    if (table_number) {
      axios
        .get("https://8000-firebase-resto-1754219676636.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev/menu/", {
          headers: { Authorization: token },
        })
        .then((res) => setMenu(res.data.menu))
        .catch((err) => console.error("Gagal fetch menu:", err));
    }
  }, [table_number]);

  const addToCart = (item: any) => {
    const qty = cart[item.name]?.quantity || 0;
    const updated = {
      ...cart,
      [item.name]: { ...item, quantity: qty + 1 },
    };
    setCart(updated);
    updateTotal(updated);
  };

  const updateTotal = (updatedCart: any) => {
    const sum = Object.values(updatedCart).reduce(
      (acc: any, item: any) => acc + item.price * item.quantity,
      0
    );
    setTotal(sum);
  };

  const increaseQty = (name: string) => {
    const updated = {
      ...cart,
      [name]: { ...cart[name], quantity: cart[name].quantity + 1 },
    };
    setCart(updated);
    updateTotal(updated);
  };

  const decreaseQty = (name: string) => {
    const currentQty = cart[name].quantity;
    if (currentQty <= 1) {
      removeItem(name);
      return;
    }

    const updated = {
      ...cart,
      [name]: { ...cart[name], quantity: currentQty - 1 },
    };
    setCart(updated);
    updateTotal(updated);
  };

  const removeItem = (name: string) => {
    const updated = { ...cart };
    delete updated[name];
    setCart(updated);
    updateTotal(updated);
  };

  const orderNow = async () => {
    const items = Object.values(cart);
    const res = await axios.post(
      "https://8000-firebase-resto-1754219676636.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev/order",
      {
        table_number: parseInt(table_number as string),
        notes,
        items,
      },
      {
        headers: { Authorization: token },
      }
    );
    setQrisUrl(res.data.qris_url);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🍽️ Meja #{table_number}</h1>

      <h2 style={styles.subheading}>Menu</h2>
      <div style={styles.grid}>
        {menu.map((item: any) => (
          <div key={item.name} style={styles.card}>
            <h3>{item.name}</h3>
            <p style={styles.price}>Rp{item.price.toLocaleString()}</p>
            <button onClick={() => addToCart(item)} style={styles.addBtn}>Tambah</button>
          </div>
        ))}
      </div>

      <h2 style={styles.subheading}>🧾 Pesanan Kamu</h2>
      {Object.keys(cart).length === 0 ? (
        <p>Belum ada item yang dipilih.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(cart).map(([name, item]: any) => (
              <tr key={name}>
                <td>{item.name}</td>
                <td>
                  <button onClick={() => decreaseQty(name)} style={styles.qtyBtn}>-</button>
                  <span style={{ margin: "0 10px" }}>{item.quantity}</span>
                  <button onClick={() => increaseQty(name)} style={styles.qtyBtn}>+</button>
                </td>
                <td>Rp{(item.quantity * item.price).toLocaleString()}</td>
                <td>
                  <button onClick={() => removeItem(name)} style={styles.delBtn}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>Catatan:</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={styles.textarea}
          placeholder="Contoh: tanpa sambal, sedikit es"
        />
        <h3>Total: <span style={styles.total}>Rp{total.toLocaleString()}</span></h3>
        <button onClick={orderNow} style={styles.payBtn}>Pesan & Bayar</button>
      </div>

      {qrisUrl && (
        <div style={{ marginTop: 30 }}>
          <h2>Scan QRIS:</h2>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisUrl)}`}
            alt="QRIS Pembayaran"
            />
        </div>
      )}
    </div>
  );
}

const styles: any = {
  container: {
    padding: 20,
    maxWidth: 720,
    margin: "auto",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  subheading: {
    fontSize: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  price: {
    fontSize: 14,
    color: "#555",
  },
  addBtn: {
    marginTop: 10,
    backgroundColor: "#2196f3",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    marginTop: 10,
    borderCollapse: "collapse",
  },
  qtyBtn: {
    padding: "4px 10px",
    fontSize: 16,
  },
  delBtn: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: 5,
    padding: "4px 8px",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    minHeight: 60,
    marginTop: 5,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  payBtn: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "#4caf50",
    color: "white",
    padding: "10px 0",
    border: "none",
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
  },
  qrisLink: {
    display: "inline-block",
    marginTop: 10,
    fontSize: 16,
    wordBreak: "break-all",
    color: "#2196f3",
  },
};
