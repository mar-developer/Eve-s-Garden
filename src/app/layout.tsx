import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eve's Garden — 3D Isometric Playground",
  description:
    "An isometric 3D web game with character design system, built with Next.js, React Three Fiber, and Drei.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
