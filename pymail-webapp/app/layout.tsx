import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Email Analyser",
  description: "Analyze and clean your inbox",
  manifest: "/favicon/site.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon/favicon.ico" },
    { rel: "icon", type: "image/svg+xml", url: "/favicon/favicon.svg" },
    { rel: "apple-touch-icon", url: "/favicon/apple-touch-icon.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
