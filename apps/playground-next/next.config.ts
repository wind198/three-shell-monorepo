import type { NextConfig } from 'next';
import { withThreeShell } from '@three-shell/next';

const config: NextConfig = { transpilePackages: ['@three-shell/core', '@three-shell/react'] };
export default withThreeShell(config);
