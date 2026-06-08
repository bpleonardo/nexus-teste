import type { Metadata } from 'next';
import { MantineProvider, mantineHtmlProps } from '@mantine/core';

import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus',
  description: 'Nexus Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <body>
        <MantineProvider defaultColorScheme="light">{children}</MantineProvider>
      </body>
    </html>
  );
}
