import * as $ from 'svelte/internal/server';

import {
	Beacon,
	Bolt,
	Cisco,
	Claude,
	Figma,
	FirebaseFull,
	Hulu,
	Spotify,
	SupabaseFull,
	VercelFull
} from "$lib/svgs";

export default function Logocloud_one($$renderer) {
	$$renderer.push(`<section class="bg-background py-16"><div class="mx-auto max-w-5xl px-6"><h2 class="text-center text-lg font-medium">Your favorite companies are our partners.</h2> <div class="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 **:fill-foreground sm:gap-x-16 sm:gap-y-12">`);
	Bolt($$renderer, { height: 22, width: 56 });
	$$renderer.push(`<!----> `);
	VercelFull($$renderer, { height: 22, width: 84 });
	$$renderer.push(`<!----> `);
	SupabaseFull($$renderer, { class: 'h-6' });
	$$renderer.push(`<!----> `);
	Hulu($$renderer, { height: 18, width: 56 });
	$$renderer.push(`<!----> `);
	Spotify($$renderer, { height: 24, width: 80 });
	$$renderer.push(`<!----> `);
	FirebaseFull($$renderer, { height: 24, width: 80 });
	$$renderer.push(`<!----> `);
	Beacon($$renderer, { height: 24, width: 80 });
	$$renderer.push(`<!----> `);
	Claude($$renderer, { height: 26, width: 90 });
	$$renderer.push(`<!----> `);
	Figma($$renderer, { height: 24, width: 24 });
	$$renderer.push(`<!----> `);
	Cisco($$renderer, { height: 30, width: 60 });
	$$renderer.push(`<!----></div></div></section>`);
}