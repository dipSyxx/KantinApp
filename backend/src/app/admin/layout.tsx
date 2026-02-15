import Link from "next/link";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { LogoutButton } from "./LogoutButton";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me"
);

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                <span className="font-bold text-lg text-emerald-700">
                  KantinApp Admin
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <NavLink href="/admin">Dashboard</NavLink>
                <NavLink href="/admin/weeks">Ukemeny</NavLink>
                <NavLink href="/admin/dishes">Retter</NavLink>
                <NavLink href="/admin/analytics">Analyse</NavLink>
              </div>
            </div>

            {/* User info + logout */}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:inline">
                  {user.role === "CANTEEN_ADMIN" ? "Kantine-admin" : "Skole-admin"}
                </span>
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
    >
      {children}
    </Link>
  );
}
