import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import ReactQueryProvider from './lib/react-query-provider';
import { AuthProvider } from './lib/auth-context';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'Finance Tracker' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
