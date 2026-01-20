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
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://skypegasus-useful.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Sky Pegasus｜天馬行空 2026 Vibe Coding 投稿活動",
  description:
    "Sky Pegasus 天馬行空 2026 Vibe Coding 投稿活動官方網站。查看活動時程、投稿規則、評選方式與精選作品，邀請所有創作者分享天馬行空的靈感。",
  alternates: {
    canonical: "/",
    languages: {
      "zh-Hant": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Sky Pegasus｜天馬行空 2026 Vibe Coding 投稿活動",
    description:
      "Sky Pegasus 天馬行空 2026 Vibe Coding 投稿活動官方網站。查看活動時程、投稿規則、評選方式與精選作品，邀請所有創作者分享天馬行空的靈感。",
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
    title: "Sky Pegasus｜天馬行空 2026 Vibe Coding 投稿活動",
    description:
      "Sky Pegasus 天馬行空 2026 Vibe Coding 投稿活動官方網站。查看活動時程、投稿規則、評選方式與精選作品，邀請所有創作者分享天馬行空的靈感。",
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
