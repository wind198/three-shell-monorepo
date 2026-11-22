import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title:'City Cross | ThreeShell World Composer',
 description:'Parametric low-poly shophouse city crossroads viewer',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="en"><body>{children}</body></html>;
}
