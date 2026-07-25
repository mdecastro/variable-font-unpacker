import type { Metadata } from "next";
import { Geist, Geist_Mono, Recursive } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const recursive = Recursive({
  variable: "--font-recursive",
  subsets: ["latin"],
  axes: ["CASL", "CRSV", "MONO", "slnt"],
});

export const metadata: Metadata = {
  title: "Variable Font Unpacker",
  description: "Inspect variable fonts and extract static instances from them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${recursive.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
