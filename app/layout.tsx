import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AppChrome } from "@/components/site-nav";
import { getSessionProfile } from "@/lib/session";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dirman Quiz",
  description: "Contekan yang halal.",
  icons: {
    icon: [
      {
        url: "/DirmanQuiz-Logo-Kit/PNG/dirmanquiz-icon-64.png",
        sizes: "64x64",
        type: "image/png",
      },
      { url: "/DirmanQuiz-Logo-Kit/SVG/dirmanquiz-icon.svg", type: "image/svg+xml" },
    ],
    apple: "/DirmanQuiz-Logo-Kit/PNG/dirmanquiz-icon-256.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const profile = await getSessionProfile();

  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <AppChrome profile={profile}>{children}</AppChrome>
      </body>
    </html>
  );
}
