import { getAllSchemas } from "@/lib/cms-service";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const schemas = getAllSchemas();

  return (
    <>
      <Header schemas={schemas} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
