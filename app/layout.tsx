import "@/styles/globals.css";
import { Metadata, Viewport } from "next";;
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import SessionProvider from "@/components/sessionProvider";
import Nav from "@/components/nav";

export const metadata: Metadata = {
  title : "Accessibility_Analyzer",
  description : "A comprehensive web accessibility analyzer featuring automated compliance checking, impact analysis, AI-powered improvement suggestions, and innovative screen reader simulation - providing complete solution for teams to audit, fix, and maintain accessible websites",
  icons: {
    icon: "/assets/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body>
        <Providers>
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
              <Nav/>
              <SessionProvider>{children}</SessionProvider>
            </main>
            <Toaster position="top-right"/>
        </Providers>
      </body>
    </html>
  );
}
