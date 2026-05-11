import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && user.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, admin");
      navigate("/admin");
    } catch (err) {
      toast.error(formatApiErrorDetail(err?.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] grid place-items-center bg-primary/5 px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md card-soft p-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center"><Lock className="h-6 w-6 text-primary" /></div>
          <div>
            <div className="font-heading font-bold text-xl">Admin Sign In</div>
            <div className="text-xs text-foreground/55">Staff only · OrbSky Hospital</div>
          </div>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="admin-email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="admin-password"
          />
          <Button type="submit" className="w-full" disabled={loading} data-testid="admin-login-btn">
            {loading ? "Signing in…" : <>Sign In <LogIn className="h-4 w-4 ml-2" /></>}
          </Button>
        </form>
        <p className="mt-4 text-xs text-foreground/55 text-center">
          Default: admin@orbskyhospital.com / OrbSky@2026
        </p>
      </div>
    </div>
  );
}
