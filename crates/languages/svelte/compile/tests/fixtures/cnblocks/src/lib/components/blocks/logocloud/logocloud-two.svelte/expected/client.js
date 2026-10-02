import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<section class="bg-background py-16"><div class="group relative m-auto max-w-5xl px-6"><div class="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100"><a href="/" class="block text-sm duration-150 hover:opacity-75"><span>Meet Our Customers</span> <!></a></div> <div class="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-x-12 gap-y-8 transition-all duration-500 **:fill-foreground group-hover:opacity-50 group-hover:blur-xs sm:gap-x-16 sm:gap-y-14 md:grid-cols-4"><div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div> <div class="flex items-center"><!></div></div></div></section>`);

export default function Logocloud_two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node = $.sibling($.child(a), 2);

	ChevronRight(node, { class: 'ml-1 inline-block size-3' });
	$.reset(a);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.child(div_2);
	var node_1 = $.child(div_3);

	Bolt(node_1, { class: 'mx-auto h-5 w-full' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	VercelFull(node_2, { class: 'mx-auto h-4 w-full' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_3 = $.child(div_5);

	SupabaseFull(node_3, { class: 'mx-auto h-6' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_4 = $.child(div_6);

	Hulu(node_4, { class: 'mx-auto h-4 w-full' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_5 = $.child(div_7);

	Spotify(node_5, { class: 'mx-auto h-6 w-full' });
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_6 = $.child(div_8);

	FirebaseFull(node_6, { class: 'mx-auto h-6 w-full' });
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_7 = $.child(div_9);

	Beacon(node_7, { class: 'mx-auto h-4 w-full' });
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_8 = $.child(div_10);

	Claude(node_8, { class: 'mx-auto h-5 w-full' });
	$.reset(div_10);
	$.reset(div_2);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}