import { useState } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    if (!supabase) {
      setMessage("Yapılandırma hatası: Supabase env değişkenleri eksik.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err) {
      setMessage(
        err.message === "Failed to fetch"
          ? "Sunucuya ulaşılamadı. Supabase URL/key ayarlarını kontrol edin."
          : err.message
      );
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif", textAlign: "center", padding: "0 20px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>🔒 VaultPay</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>Gizli USDC Ödeme Platformu</p>
      <div style={{ background: "#f9f9f9", padding: 32, borderRadius: 16 }}>
        <h2 style={{ marginBottom: 24 }}>{isSignUp ? "Kayıt Ol" : "Giriş Yap"}</h2>
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box" }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: 20, borderRadius: 8, border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box" }}
        />
        {message && <p style={{ color: message.includes("başarılı") ? "green" : "red", marginBottom: 12 }}>{message}</p>}
        <button
          onClick={handleAuth}
          disabled={loading}
          style={{ width: "100%", padding: "14px", background: "#0066ff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer", marginBottom: 12 }}
        >
          {loading ? "..." : isSignUp ? "Kayıt Ol" : "Giriş Yap"}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: "none", border: "none", color: "#0066ff", cursor: "pointer", fontSize: 14 }}
        >
          {isSignUp ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol"}
        </button>
      </div>
    </div>
  );
}
