import { withThreeShell } from '@three-shell/next';
export default withThreeShell({
  transpilePackages: [
    '@three-shell/core','@three-shell/react','@three-shell/world-assets',
    '@three-shell/world-composition',
  ],
});
