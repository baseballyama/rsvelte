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

var root = $.from_html(`<div class="mx-auto flex h-44 max-w-lg flex-col justify-between **:fill-foreground"><div class="relative flex h-10 items-center justify-between gap-12 @lg:px-6"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-10 items-center justify-between px-12 @lg:px-24"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="absolute inset-0 my-auto h-px w-1/2 bg-linear-to-r from-primary via-amber-500 to-pink-400 mask-r-from-75% mask-r-to-75% mask-l-from-15% mask-l-to-40%"></div> <div class="absolute inset-0 my-auto ml-auto h-px w-1/2 bg-linear-to-r from-indigo-500 via-emerald-500 to-blue-400 mask-r-from-15% mask-r-to-40% mask-l-from-75% mask-l-to-75%"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="rounded-full border border-dashed border-foreground/15 p-2"><div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-10 items-center justify-between gap-12 @lg:px-6"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div></div>`);

export default function Integration_illustration($$anchor) {
	var div = root();

	$.set_attribute(div, 'aria-hidden', true);

	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Vercel(node, { class: 'size-3.5' });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	Slack(node_1, { class: 'size-3.5' });
	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.sibling($.child(div_4), 6);
	var node_2 = $.child(div_5);

	Clerk(node_2, { class: 'size-3.5' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var div_7 = $.child(div_6);
	var node_3 = $.child(div_7);

	Logo(node_3, { class: 'h-4' });
	$.reset(div_7);
	$.reset(div_6);

	var div_8 = $.sibling(div_6, 2);
	var node_4 = $.child(div_8);

	Linear(node_4, { class: 'size-3.5' });
	$.reset(div_8);
	$.reset(div_4);

	var div_9 = $.sibling(div_4, 2);
	var div_10 = $.sibling($.child(div_9), 2);
	var node_5 = $.child(div_10);

	Supabase(node_5, { class: 'size-3.5' });
	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_6 = $.child(div_11);

	Firebase(node_6, { class: 'size-3.5' });
	$.reset(div_11);
	$.reset(div_9);
	$.reset(div);
	$.append($$anchor, div);
}