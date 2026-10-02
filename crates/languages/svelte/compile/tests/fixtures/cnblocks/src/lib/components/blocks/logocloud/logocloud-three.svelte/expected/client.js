import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<section class="overflow-hidden bg-background py-16"><div class="group relative m-auto max-w-7xl px-6"><div class="flex flex-col items-center md:flex-row"><div class="md:max-w-44 md:border-r md:pr-6"><p class="text-end text-sm">Powering the best teams</p></div> <div class="relative py-6 **:fill-foreground md:w-[calc(100%-11rem)]"><!> <div class="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background"></div> <div class="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-background"></div> <!> <!></div></div></div></section>`);

export default function Logocloud_three($$anchor, $$props) {
	$.push($$props, true);

	const GRADIENT_ANGLES = { top: 0, right: 90, bottom: 180, left: 270 };
	var $$exports = { GRADIENT_ANGLES };
	var section = root_1();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Marquee(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Bolt(node_1, { height: 22, width: 56 });

			var node_2 = $.sibling(node_1, 2);

			VercelFull(node_2, { height: 22, width: 84 });

			var node_3 = $.sibling(node_2, 2);

			SupabaseFull(node_3, { class: 'h-6' });

			var node_4 = $.sibling(node_3, 2);

			Hulu(node_4, { height: 18, width: 56 });

			var node_5 = $.sibling(node_4, 2);

			Spotify(node_5, { height: 24, width: 80 });

			var node_6 = $.sibling(node_5, 2);

			FirebaseFull(node_6, { height: 24, width: 80 });

			var node_7 = $.sibling(node_6, 2);

			Beacon(node_7, { height: 24, width: 80 });

			var node_8 = $.sibling(node_7, 2);

			Claude(node_8, { height: 26, width: 90 });

			var node_9 = $.sibling(node_8, 2);

			Figma(node_9, { height: 24, width: 24 });

			var node_10 = $.sibling(node_9, 2);

			Cisco(node_10, { height: 30, width: 60 });
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_3 = $.sibling(node, 2);

	$.set_attribute(div_3, 'aria-hidden', true);

	var div_4 = $.sibling(div_3, 2);

	$.set_attribute(div_4, 'aria-hidden', true);

	var node_11 = $.sibling(div_4, 2);

	ProgressiveBlur(node_11, {
		direction: 'left',
		blurIntensity: 1,
		class: 'pointer-events-none absolute top-0 left-0 h-full w-20'
	});

	var node_12 = $.sibling(node_11, 2);

	ProgressiveBlur(node_12, {
		direction: 'right',
		blurIntensity: 1,
		class: 'pointer-events-none absolute top-0 right-0 h-full w-20'
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);

	return $.pop($$exports);
}