import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

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
    <html lang="en" className={firaCode.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
