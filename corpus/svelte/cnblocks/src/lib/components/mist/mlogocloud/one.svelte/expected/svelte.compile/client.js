import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Cisco, Slack, Spotify, Vercel } from "$lib/svgs";

var root = $.from_html(`<section><div class="mx-auto max-w-5xl px-6 py-8"><div><p class="font-medium text-muted-foreground">Trusted by teams at :</p> <div class="mt-4 flex items-center gap-12"><div class="flex items-center justify-center"><!></div> <div class="flex items-center justify-center"><!></div> <div class="flex items-center justify-center"><!></div> <div class="flex items-center justify-center"><!></div></div></div></div></section>`);

export default function One($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	Vercel(node, { class: 'h-5 w-full text-foreground', variant: 'full' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_1 = $.child(div_4);

	Cisco(node_1, { class: 'h-4 w-full text-foreground' });
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_2 = $.child(div_5);

	Slack(node_2, { class: 'h-4 w-full' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_3 = $.child(div_6);

	Spotify(node_3, { class: 'h-5 w-full' });
	$.reset(div_6);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}