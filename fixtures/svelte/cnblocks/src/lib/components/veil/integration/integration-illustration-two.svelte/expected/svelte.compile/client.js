import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Bolt as Logo,
	Clerk,
	Firebase,
	Linear,
	Slack,
	Supabase,
	Vercel
} from "$lib/svgs/index";

var root = $.from_html(`<div class="relative mx-auto flex size-96 **:fill-foreground @max-md:scale-85"><div class="relative inset-0 m-auto flex size-12 items-center rounded-full bg-card shadow-sm ring shadow-black/6.5 ring-border *:m-auto"><!></div> <div class="absolute inset-0 flex rotate-120 items-center justify-between gap-12 *:-rotate-120"><div class="absolute inset-4 rounded-full border border-dashed border-foreground/10"></div> <div class="relative flex size-9 items-center rounded-full border bg-muted backdrop-blur *:m-auto"><!></div> <div class="relative flex size-9 items-center rounded-full bg-card shadow-sm ring shadow-black/6.5 ring-border *:m-auto"><!></div></div> <div class="absolute inset-12 flex items-center justify-between gap-12"><div class="absolute inset-4 rounded-full border border-dashed border-foreground/10"></div> <div class="relative flex size-9 items-center rounded-full border bg-muted backdrop-blur *:m-auto"><!></div> <div class="relative flex size-9 items-center rounded-full bg-card shadow-sm ring shadow-black/6.5 ring-border *:m-auto"><!></div></div> <div class="absolute inset-24 flex rotate-45 items-center justify-between gap-12 *:-rotate-45"><div class="absolute inset-4 rounded-full border border-dashed border-foreground/10"></div> <div class="relative flex size-9 items-center rounded-full bg-card shadow-sm ring shadow-black/6.5 ring-border *:m-auto"><!></div> <div class="relative flex size-9 items-center rounded-full border bg-muted backdrop-blur *:m-auto"><!></div></div></div>`);

export default function Integration_illustration_two($$anchor) {
	var div = root();

	$.set_attribute(div, 'aria-hidden', true);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	Logo(node, { class: 'size-5' });
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_1 = $.child(div_3);

	Firebase(node_1, { class: 'size-3.5' });
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_2 = $.child(div_4);

	Supabase(node_2, { class: 'size-3.5' });
	$.reset(div_4);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var node_3 = $.child(div_6);

	Vercel(node_3, { class: 'size-3.5' });
	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_4 = $.child(div_7);

	Slack(node_4, { class: 'size-3.5' });
	$.reset(div_7);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var node_5 = $.child(div_9);

	Clerk(node_5, { class: 'size-3.5' });
	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_6 = $.child(div_10);

	Linear(node_6, { class: 'size-3.5' });
	$.reset(div_10);
	$.reset(div_8);
	$.reset(div);
	$.append($$anchor, div);
}