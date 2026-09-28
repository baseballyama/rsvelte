import * as $ from 'svelte/internal/server';
import ChevronRight from "@lucide/svelte/icons/chevron-right";

import {
	Beacon,
	Bolt,
	Claude,
	Firebase,
	FirebaseFull,
	Hulu,
	Spotify,
	Supabase,
	SupabaseFull,
	Vercel,
	VercelFull
} from "$lib/svgs";

export default function Logocloud_two($$renderer) {
	$$renderer.push(`<section class="bg-background py-16"><div class="group relative m-auto max-w-5xl px-6"><div class="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100"><a href="/" class="block text-sm duration-150 hover:opacity-75"><span>Meet Our Customers</span> `);
	ChevronRight($$renderer, { class: 'ml-1 inline-block size-3' });
	$$renderer.push(`<!----></a></div> <div class="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-x-12 gap-y-8 transition-all duration-500 **:fill-foreground group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14 md:grid-cols-4"><div class="flex items-center">`);
	Bolt($$renderer, { class: 'mx-auto h-5 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	VercelFull($$renderer, { class: 'mx-auto h-4 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	SupabaseFull($$renderer, { class: 'mx-auto h-6' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	Hulu($$renderer, { class: 'mx-auto h-4 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	Spotify($$renderer, { class: 'mx-auto h-6 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	FirebaseFull($$renderer, { class: 'mx-auto h-6 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	Beacon($$renderer, { class: 'mx-auto h-4 w-full' });
	$$renderer.push(`<!----></div> <div class="flex items-center">`);
	Claude($$renderer, { class: 'mx-auto h-5 w-full' });
	$$renderer.push(`<!----></div></div></div></section>`);
}