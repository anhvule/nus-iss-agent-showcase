import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EduAgent Connect',
  description:
    'A prototype demonstrating an Agent Ready education website using a WebMCP-style capability layer.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
