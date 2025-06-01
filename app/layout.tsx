import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/common/header';
import Footer from '@/components/common/footer';
import { UserSync } from '@/components/UserSync';
import { AppProvider } from '@/context/AppContext';
// Configure font
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'AI PDF Chat - Chat with your PDFs using AI',
  description: 'Upload and chat with your PDF documents using advanced AI',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>InsightPDF - AI-Powered PDF Analysis</title>
        <meta name="description" content="Upload and analyze your PDFs with AI-powered insights" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
              footerActionLink: 'text-indigo-500 hover:text-indigo-600',
              card: 'shadow-lg',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
              socialButtonsBlockButtonText: 'text-gray-700',
              formFieldInput: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
              formFieldLabel: 'text-gray-700',
            },
          }}
        >
          <AppProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster position="top-right" richColors />
              <UserSync />
            </ThemeProvider>
          </AppProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
