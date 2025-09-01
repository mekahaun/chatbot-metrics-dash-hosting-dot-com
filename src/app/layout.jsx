import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/Shared/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chatbot Metrics Dashboard",
  description: "Analytics dashboard for chatbot performance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>{children}</NextAuthProvider>
        {children}
      </body>
    </html>
  );
}
