import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AppBackground } from "@/components/app-background";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "MEMORIA",
  description: "写真が、思い出の1ページになる",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: '"Noto Sans JP", "Inter", system-ui, sans-serif' }}
      >
        <AppBackground />
        <main
          className="flex-1"
          style={{
            paddingBottom:
              "calc(var(--nav-height) + var(--nav-float-inset) + env(safe-area-inset-bottom) + 0.5rem)",
          }}
        >
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
