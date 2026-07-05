import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      loadTransactions(session.user.id);
    });
  }, []);

  async function loadTransactions(userId) {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false });
    setTransactions(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleSend() {
    if (!walletAddress) return alert("Alıcı adresi girin!");
    const amount = prompt("Miktar (USDC)?");
    if (!amount) return;
    router.push(`/pay?to=${walletAddress}&amount=${amount}`);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>🔒 VaultPay</h1>
        <button onClick={handleLogout} style={{ background: "none", border: "1px solid #ddd", padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>Çıkış</button>
      </div>

      <div style={{ background: "#0066ff", color: "#fff", padding: 24, borderRadius: 16, marginBottom: 24 }}>
        <p style={{ margin: 0, opacity: 0.8 }}>Hoş geldiniz</p>
        <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.7 }}>{user?.email}</p>
      </div>

      <div style={{ background: "#f9f9f9", padding: 24, borderRadius: 16, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>💸 Ödeme Gönder</h3>
        <input
          placeholder="Alıcı cüzdan adresi (0x...)"
          value={walletAddress}
          onChange={e => setWalletAddress(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
        />
        <button
          onClick={handleSend}
          style={{ width: "100%", padding: 14, background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}
        >
          Ödeme Gönder →
        </button>
      </div>

      <div>
        <h3>📋 İşlem Geçmişi</h3>
        {transactions.length === 0 ? (
          <p style={{ color: "#999" }}>Henüz işlem yok.</p>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} style={{ background: "#f9f9f9", padding: 16, borderRadius: 12, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{tx.amount} USDC</span>
                <span style={{ color: tx.status === "confirmed" ? "green" : "orange", fontSize: 12 }}>{tx.status}</span>
              </div>
              <p style={{ margin: "4px 0", fontSize: 12, color: "#666" }}>→ {tx.recipient_address}</p>
              {tx.tx_hash && <p style={{ margin: "4px 0", fontSize: 11, color: "#999" }}>TX: {tx.tx_hash}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
