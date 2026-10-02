import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<section class="bg-background py-16"><div class="mx-auto max-w-5xl px-6"><h2 class="text-center text-lg font-medium">Your favorite companies are our partners.</h2> <div class="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 **:fill-foreground sm:gap-x-16 sm:gap-y-12"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div></section>`);

export default function Logocloud_one($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Bolt(node, { height: 22, width: 56 });

	var node_1 = $.sibling(node, 2);

	VercelFull(node_1, { height: 22, width: 84 });

	var node_2 = $.sibling(node_1, 2);

	SupabaseFull(node_2, { class: 'h-6' });

	var node_3 = $.sibling(node_2, 2);

	Hulu(node_3, { height: 18, width: 56 });

	var node_4 = $.sibling(node_3, 2);

	Spotify(node_4, { height: 24, width: 80 });

	var node_5 = $.sibling(node_4, 2);

	FirebaseFull(node_5, { height: 24, width: 80 });

	var node_6 = $.sibling(node_5, 2);

	Beacon(node_6, { height: 24, width: 80 });

	var node_7 = $.sibling(node_6, 2);

	Claude(node_7, { height: 26, width: 90 });

	var node_8 = $.sibling(node_7, 2);

	Figma(node_8, { height: 24, width: 24 });

	var node_9 = $.sibling(node_8, 2);

	Cisco(node_9, { height: 30, width: 60 });
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}