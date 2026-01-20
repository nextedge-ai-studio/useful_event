import type { Metadata } from "next";
import { Inter, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Noto_Serif_TC({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sky Pegasus｜天馬行空",
  description: "2026 Vibe Coding Creative Event",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Sky Pegasus｜天馬行空",
    description: "2026 Vibe Coding Creative Event",
    images: [
      {
        url: "/hourse.png",
        width: 1200,
        height: 630,
        alt: "Sky Pegasus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sky Pegasus｜天馬行空",
    description: "2026 Vibe Coding Creative Event",
    images: ["/hourse.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Sky Pegasus",
    url: siteUrl,
    logo: `${siteUrl}/hourse.png`,
  };

  return (
    <html lang="zh-Hant" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationLd),
          }}
        />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
