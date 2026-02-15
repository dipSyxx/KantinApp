export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No admin nav on the login page
  return <>{children}</>;
}
