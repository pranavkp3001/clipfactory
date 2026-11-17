import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clip Factory — Creator operations",
  description: "Campaign-first clipping operations dashboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}