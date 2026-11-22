import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asset Lighting Room | ThreeShell',
  description: 'Inspect and tune procedural Three.js world assets',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
