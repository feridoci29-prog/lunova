import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/lunova/Brand";
import { useAuth } from "@/components/lunova/AuthProvider";

export function PublicHeader() {
  const { session } = useAuth();
  return (
    <header className="dw-header">
      <Brand />
      <nav className="dw-nav" aria-label="Main navigation">
        <Link to="/templates">Templates</Link>
        <Link to="/preview">Explore</Link>
        <Link to="/pricing">Pricing</Link>
      </nav>
      <div className="dw-header-actions">
        <Link to={session?.mode === "firebase" ? "/dashboard" : "/login"}>
          {session?.mode === "firebase" ? "Workspace" : "Log in"}
        </Link>
        <Link className="dw-button" to={session?.mode === "firebase" ? "/dashboard" : "/signup"}>
          Start building <ArrowUpRight size={13} />
        </Link>
      </div>
    </header>
  );
}
