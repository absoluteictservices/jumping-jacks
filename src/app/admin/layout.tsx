import type { Metadata } from "next";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { login, logout } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/inflatables", label: "Inflatables" },
  { href: "/admin/blackouts", label: "Blackout dates" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <LoginScreen />;
  }
  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-brand-purple">Jumping Jacks Admin</h1>
        <form action={logout}>
          <button className="btn-secondary !py-2 text-sm">Log out</button>
        </form>
      </div>
      <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto border-b border-black/10 px-4 pb-3 sm:mx-0 sm:flex-wrap sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 whitespace-nowrap rounded-full bg-brand-violet/5 px-4 py-2 text-sm font-bold text-brand-ink/70 hover:bg-brand-violet/15 hover:text-brand-purple"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <form action={login} className="card w-full max-w-sm p-8">
        <h1 className="text-2xl">Owner login</h1>
        <p className="mt-2 text-sm text-brand-ink/60">Enter your admin password to manage bookings.</p>
        <label htmlFor="password" className="mt-6 block text-sm font-bold text-brand-ink/80">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
        />
        <button className="btn-primary mt-5 w-full">Log in</button>
      </form>
    </div>
  );
}
