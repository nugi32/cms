import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner font-mono">
        <span>Served from a schema-driven CMS</span>
        <Link href="/admin">Admin →</Link>
      </div>
    </footer>
  );
}
