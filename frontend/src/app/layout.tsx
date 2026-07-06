import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppContextProvider } from "../components/AppContext";
import { Shell } from "../components/Shell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Instagram AI Clone",
  description: "A production-grade AI-powered Instagram clone with feed ranking, moderation, and tag suggestions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white`}
      >
        <AppContextProvider>
          <Shell>{children}</Shell>
        </AppContextProvider>
      </body>
    </html>
  );
}
