import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bytescare – You Create, We Protect",
  description:
    "Bytescare customer onboarding – Digital protection services for individuals and businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
