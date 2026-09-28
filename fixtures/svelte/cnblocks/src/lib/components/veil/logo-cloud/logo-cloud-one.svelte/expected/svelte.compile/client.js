import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<section class="@container bg-background py-12"><div class="mx-auto max-w-xl px-6"><div class="grid grid-cols-3 gap-x-8 gap-y-12 *:flex *:items-center *:justify-center **:fill-foreground @xl:grid-cols-4"><div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div></div></div></section>`);

export default function Logo_cloud_one($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	VercelFull(node, { class: 'h-3.5 w-full' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Spotify(node_1, { class: 'h-4.5 w-full' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	SupabaseFull(node_2, { class: 'h-5' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_3 = $.child(div_5);

	Hulu(node_3, { class: 'h-3.5 w-full' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_4 = $.child(div_6);

	Bolt(node_4, { class: 'h-4 w-full' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_5 = $.child(div_7);

	Linear(node_5, { class: 'size-4' });
	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_6 = $.child(div_8);

	Cisco(node_6, { class: 'h-5 w-full' });
	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_7 = $.child(div_9);

	Beacon(node_7, { class: 'h-3.5 w-full' });
	$.reset(div_9);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}