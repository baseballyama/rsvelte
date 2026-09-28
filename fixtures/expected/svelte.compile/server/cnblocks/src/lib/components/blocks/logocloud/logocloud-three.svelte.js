import * as $ from 'svelte/internal/server';
import { Marquee } from "$lib/components/magic/marquee";
import { ProgressiveBlur } from "$lib/components/magic/progressive-blur";

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

import { cn } from "$lib/utils";

export default function Logocloud_three($$renderer, $$props) {
	const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };

	$$renderer.push(`<section class="overflow-hidden bg-background py-16"><div class="group relative m-auto max-w-7xl px-6"><div class="flex flex-col items-center md:flex-row"><div class="md:max-w-44 md:border-r md:pr-6"><p class="text-end text-sm">Powering the best teams</p></div> <div class="relative py-6 **:fill-foreground md:w-[calc(100%-11rem)]">`);

	Marquee($$renderer, {
		children: ($$renderer) => {
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
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div${$.attr('aria-hidden', true)} class="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background"></div> <div${$.attr('aria-hidden', true)} class="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background"></div> `);

	ProgressiveBlur($$renderer, {
		direction: 'left',
		blurIntensity: 1,
		class: 'pointer-events-none absolute top-0 left-0 h-full w-20'
	});

	$$renderer.push(`<!----> `);

	ProgressiveBlur($$renderer, {
		direction: 'right',
		blurIntensity: 1,
		class: 'pointer-events-none absolute top-0 right-0 h-full w-20'
	});

	$$renderer.push(`<!----></div></div></div></section>`);
	$.bind_props($$props, { GRADIENT_ANGLES });
}