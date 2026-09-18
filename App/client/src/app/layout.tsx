import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = {
  title: 'EduAgent Connect',
  description:
    'An original demonstration website exploring how an education platform can become Agent Ready. Synthetic data only; WebMCP is a future capability and is not implemented.',
};

/**
 * Root layout: the website shell (FR-008). Provides semantic landmarks
 * (header / main / footer), a keyboard skip link, and consistent structure that
 * wraps every route.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-sky-700 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <PageContainer>{children}</PageContainer>
        <Footer />
      </body>
    </html>
  );
}
