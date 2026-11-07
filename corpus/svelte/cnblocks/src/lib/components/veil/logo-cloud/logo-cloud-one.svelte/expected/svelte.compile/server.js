import * as $ from 'svelte/internal/server';

import {
	Spotify,
	Bolt,
	Hulu,
	Linear,
	Cisco,
	Beacon,
	VercelFull,
	SupabaseFull
} from "$lib/svgs";

export default function Logo_cloud_one($$renderer) {
	$$renderer.push(`<section class="@container bg-background py-12"><div class="mx-auto max-w-xl px-6"><div class="grid grid-cols-3 gap-x-8 gap-y-12 *:flex *:items-center *:justify-center **:fill-foreground @xl:grid-cols-4"><div>`);
	VercelFull($$renderer, { class: 'h-3.5 w-full' });
	$$renderer.push(`<!----></div> <div>`);
	Spotify($$renderer, { class: 'h-4.5 w-full' });
	$$renderer.push(`<!----></div> <div>`);
	SupabaseFull($$renderer, { class: 'h-5' });
	$$renderer.push(`<!----></div> <div>`);
	Hulu($$renderer, { class: 'h-3.5 w-full' });
	$$renderer.push(`<!----></div> <div>`);
	Bolt($$renderer, { class: 'h-4 w-full' });
	$$renderer.push(`<!----></div> <div>`);
	Linear($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----></div> <div>`);
	Cisco($$renderer, { class: 'h-5 w-full' });
	$$renderer.push(`<!----></div> <div>`);
	Beacon($$renderer, { class: 'h-3.5 w-full' });
	$$renderer.push(`<!----></div></div></div></section>`);
}