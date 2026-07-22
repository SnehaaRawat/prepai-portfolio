import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-6">
      <Link to="/" className="font-display text-xl tracking-tight text-paper">
        PrepAI
      </Link>
      <nav className="flex items-center gap-6 text-sm text-paper/70 font-body">
        <Link to="/dashboard" className="hover:text-paper transition-colors">
          Dashboard
        </Link>
        <Link
          to="/login"
          className="rounded-full border border-paper/20 px-4 py-2 hover:border-accent hover:text-paper transition-colors"
        >
          Sign in
        </Link>
      </nav>
    </header>
  );
}
