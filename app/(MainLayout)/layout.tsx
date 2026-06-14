import Footer from "@/components/home/Footer";


export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="grow">{children}</div>
      <Footer />
    </div>
  );
}
