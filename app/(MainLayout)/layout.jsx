import Footer from "@/shared/Footer";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="grow">{children}</div>
      <Footer />
    </div>
  );
}
