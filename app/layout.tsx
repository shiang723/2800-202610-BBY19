import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClientForServerComponent } from "@/lib/supabase/server";
import GlobalNotificationHandler from "@/components/GlobalNotificationHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vancooler",
  description: "Help users to alleviate the negative effects of Vancouver heatwaves",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClientForServerComponent();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}
        {user && (<GlobalNotificationHandler userID={user?.id} />)}
      </body>
    </html>
  );
}
