import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consulta CNPJ Multi-API",
  description: "Sistema de consulta CNPJ com múltiplas APIs e bypass automático",
  keywords: ["CNPJ", "Consulta", "API", "Multi-API", "Bypass"],
  authors: [{ name: "CNPJ Consultation System" }],
  openGraph: {
    title: "Consulta CNPJ Multi-API",
    description: "Sistema de consulta CNPJ com múltiplas APIs e bypass automático",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        style={{
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          margin: 0,
          padding: 0,
          minHeight: '100vh'
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
