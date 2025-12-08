import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/context/Web3Provider";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import FarcasterProvider from "@/components/FarcasterProvider";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
});

// Farcaster Frame metadata
const appUrl = process.env.NEXT_PUBLIC_URL || "https://ebook-mp.vercel.app";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Ebook Marketplace | Buy & Sell Ebooks on Base & Celo",
  description: "A decentralized marketplace for ebooks. Buy and sell PDF ebooks using USDC on Base or cUSD on Celo.",
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg" },
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
    apple: "/logo.jpg",
    shortcut: "/logo.jpg",
  },
  openGraph: {
    title: "Ebook Marketplace",
    description: "Buy & sell ebooks on Base and Celo chains",
    images: [`${appUrl}/logo.jpg`],
    url: appUrl,
  },
  other: {
    // Farcaster Frame embed meta tags
    "fc:frame": "next",
    "fc:frame:image": `${appUrl}/logo.jpg`,
    "fc:frame:image:aspect_ratio": "1:1",
    "fc:frame:button:1": "Open App",
    "fc:frame:button:1:action": "launch_frame",
    "fc:frame:button:1:target": appUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = headers().get("cookie");

  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-[#0a0a14] min-h-screen`}
      >
        <FarcasterProvider>
          <Web3Provider cookies={cookies}>
            <MarketplaceProvider>
              {children}
            </MarketplaceProvider>
          </Web3Provider>
        </FarcasterProvider>
      </body>
    </html>
  );
}
