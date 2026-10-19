import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-muted">This page does not exist. · Yeh page mojood nahi.</p>
      <Link href="/" className="text-blue underline">
        Dashboard
      </Link>
    </div>
  );
}
