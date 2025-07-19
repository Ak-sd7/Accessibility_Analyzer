import "@/styles/globals.css";
import { Metadata, Viewport } from "next";;

import { Providers } from "./providers";

export const metadata: Metadata = {
  title : "Accessibility_Analyzer",
  description : "A comprehensive web accessibility analyzer featuring automated compliance checking, impact analysis, AI-powered improvement suggestions, and innovative screen reader simulation - providing complete solution for teams to audit, fix, and maintain accessible websites"
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
              {children}
            </main>
        </Providers>
      </body>
    </html>
  );
}
