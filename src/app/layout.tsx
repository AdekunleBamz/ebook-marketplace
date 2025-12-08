import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/context/Web3Provider";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
});

// Farcaster Frame metadata
const appUrl = process.env.NEXT_PUBLIC_URL || "https://ebook-marketplace.vercel.app";

export const metadata: Metadata = {
  title: "Ebook Marketplace | Buy & Sell Ebooks on Base & Celo",
  description: "A decentralized marketplace for ebooks. Buy and sell PDF ebooks using USDC on Base or cUSD on Celo.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Ebook Marketplace",
    description: "Buy & sell ebooks on Base and Celo chains",
    images: ["/logo.jpg"],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${appUrl}/og-image.png`,
    "fc:frame:button:1": "Browse Books",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": appUrl,
    "fc:frame:button:2": "Sell Your Ebook",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${appUrl}/upload`,
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
        <Web3Provider cookies={cookies}>
          <MarketplaceProvider>
            {children}
          </MarketplaceProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
