import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Routify - GPS Route Mapping & Tracking",
    template: "%s | Routify"
  },
  description: "Create, save, and manage your GPS routes with real-time location tracking. Perfect for runners, hikers, cyclists, and outdoor enthusiasts. Track your paths, save favorite routes, and never lose your way.",
  keywords: [
    "GPS tracking",
    "route mapper",
    "location tracking",
    "running routes",
    "hiking trails",
    "cycling paths",
    "outdoor navigation",
    "waypoint tracking",
    "route planning",
    "GPS coordinates",
    "map tracker",
    "fitness tracking"
  ],
  authors: [{ name: "Routify Team" }],
  creator: "Routify",
  publisher: "Routify",
  metadataBase: new URL("https://routifygps.vercel.app"), // TO DO
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Routify - GPS Route Mapping & Tracking",
    description: "Create, save, and manage your GPS routes with real-time location tracking. Perfect for runners, hikers, cyclists, and outdoor enthusiasts.",
    url: "https://routifygps.vercel.app", // TO DO
    siteName: "Routify",
    images: [
      {
        url: "https://res.cloudinary.com/dddzjiuet/image/upload/v1771190139/nr6jzxb1js9bnxu6ittf.jpg",
        width: 1200,
        height: 630,
        alt: "Routify - GPS Route Mapping Application"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg"
      }
    ]
  },
  manifest: "/site.webmanifest",
  applicationName: "Routify",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Routify"
  },
  formatDetection: {
    telephone: false
  },
  category: "navigation"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}