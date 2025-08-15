import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TJM Pro — Calculateur freelance",
  description: "Calculateur de TJM/THM pour freelances (France). Partageable, gratuit, prêt à monétiser."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
