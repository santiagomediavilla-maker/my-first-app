import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Launchpad — AI Business Validation",
  description: "Validate your business idea end-to-end with AI-powered research simulation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <div className="min-h-screen bg-[#f8f8f6]">
          <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
                Launchpad
                <span className="ml-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </Link>
              <Link
                href="/sessions/new"
                className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                New Validation
              </Link>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
