import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ClimateAlert Hub | Climate & Disaster Analytics",
  description:
    "Real-time climate monitoring and disaster management dashboard for India. Track floods, cyclones, earthquakes, and access emergency resources.",
  keywords: [
    "climate",
    "disaster",
    "management",
    "India",
    "flood",
    "cyclone",
    "earthquake",
    "emergency",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
