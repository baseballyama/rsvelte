import type { Reroute } from '@sveltejs/kit';

export const reroute = (({ url }) => url.pathname) satisfies Reroute;
