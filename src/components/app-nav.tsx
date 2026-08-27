import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export async function AppNav() {
  const session = await getSession();

  if (!session) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="pi-mono text-sm font-semibold tracking-tight text-foreground">
            PartInspect
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="pi-btn pi-btn-ghost">
              Sign in
            </Link>
            <Link href="/register" className="pi-btn pi-btn-primary">
              Get started
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/parts", label: "Parts" },
    { href: "/batches", label: "Batches" },
    { href: "/reject-codes", label: "Reject Codes" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="pi-mono text-sm font-semibold tracking-tight text-foreground"
          >
            PartInspect
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-[13px] text-muted transition hover:bg-white/[0.04] hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-[13px] font-medium text-foreground">{session.name}</p>
            <p className="pi-mono text-[11px] text-muted-dim">{session.companyName}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="pi-btn pi-btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
