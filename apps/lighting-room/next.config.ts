import type { NextConfig } from 'next';
import { withThreeShell } from '@three-shell/next';
import { withWorldAssets } from '../../tools/asset-discovery/discovery.mjs';

const config: NextConfig = {
  transpilePackages: ['@three-shell/core', '@three-shell/react', '@three-shell/world-assets'],
};
export default withThreeShell(withWorldAssets(config));
