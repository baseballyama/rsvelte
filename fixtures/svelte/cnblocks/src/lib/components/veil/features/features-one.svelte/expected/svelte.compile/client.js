import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "$lib/components/ui/veil/card";
import Shield from "@lucide/svelte/icons/shield";
import { Clerk, Firebase, Linear, Slack, Supabase, Vercel } from "$lib/svgs/index";

var root = $.from_html(`<div class="space-y-2"><h3 class="font-medium text-foreground">Seamless Integrations</h3> <p class="text-sm text-muted-foreground">Connect your favorite tools and services with just a few clicks.</p></div> <div class="flex h-44 flex-col justify-between pt-8 **:fill-foreground"><div class="relative flex h-10 items-center gap-12 px-6"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-10 items-center justify-between gap-12 pr-6 pl-17"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div> <div class="relative flex h-10 items-center gap-20 px-8"><div class="absolute inset-0 my-auto h-px bg-border"></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div> <div class="relative flex h-8 items-center rounded-full bg-card px-3 shadow-sm ring shadow-black/6.5 ring-border"><!></div></div></div>`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><h3 class="font-medium text-foreground">Real-time Sync</h3> <p class="text-sm text-muted-foreground">Keep your data synchronized across all platforms automatically.</p></div> <div class="relative h-44 translate-y-6"><div class="absolute inset-0 mx-auto w-px bg-foreground/15"></div> <div class="absolute -inset-x-16 top-6 aspect-square rounded-full border"></div> <div class="absolute -inset-x-16 top-6 aspect-square rounded-full border border-primary mask-r-from-50% mask-r-to-50% mask-l-from-50% mask-l-to-90%"></div> <div class="absolute -inset-x-8 top-24 aspect-square rounded-full border"></div> <div class="absolute -inset-x-8 top-24 aspect-square rounded-full border border-lime-500 mask-r-from-50% mask-r-to-90% mask-l-from-50% mask-l-to-50%"></div></div>`, 1);
var root_2 = $.from_html(`<div class="space-y-2"><h3 class="font-medium text-foreground">Developer First</h3> <p class="mt-2 text-sm text-muted-foreground">Built with developers in mind, featuring comprehensive APIs and SDKs.</p></div> <div class="flex h-44 justify-between pt-12 pb-6 *:h-full *:w-px *:bg-foreground/15"><div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div class="bg-primary!"></div></div>`, 1);
var root_3 = $.from_html(`<div class="space-y-2"><h3 class="font-medium">Enterprise Ready</h3> <p class="text-sm text-muted-foreground">Scale confidently with enterprise-grade security and reliability.</p></div> <div class="pointer-events-none relative -ml-7 flex size-44 items-center justify-center pt-5"><!> <!></div>`, 1);
var root_4 = $.from_html(`<section class="@container bg-background py-24"><div class="mx-auto max-w-2xl px-6"><div><h2 class="font-serif text-4xl font-medium text-balance">Powerful Features for Modern Teams</h2> <p class="mt-4 text-balance text-muted-foreground">Everything you need to build, connect, and scale your integrations effortlessly.</p></div> <div class="mt-12 grid gap-3 *:p-6 @xl:grid-cols-2"><!> <!> <!> <!></div></div></section>`);

export default function Features_one($$anchor) {
	var section = root_4();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Card(node, {
		variant: 'outline',
		class: 'row-span-2 grid grid-rows-subgrid',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var div_2 = $.sibling($.first_child(fragment), 2);

			$.set_attribute(div_2, 'aria-hidden', true);

			var div_3 = $.child(div_2);
			var div_4 = $.sibling($.child(div_3), 2);
			var node_1 = $.child(div_4);

			Vercel(node_1, { class: 'size-3.5' });
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_2 = $.child(div_5);

			Slack(node_2, { class: 'size-3.5' });
			$.reset(div_5);
			$.reset(div_3);

			var div_6 = $.sibling(div_3, 2);
			var div_7 = $.sibling($.child(div_6), 2);
			var node_3 = $.child(div_7);

			Clerk(node_3, { class: 'size-3.5' });
			$.reset(div_7);

			var div_8 = $.sibling(div_7, 2);
			var node_4 = $.child(div_8);

			Linear(node_4, { class: 'size-3.5' });
			$.reset(div_8);
			$.reset(div_6);

			var div_9 = $.sibling(div_6, 2);
			var div_10 = $.sibling($.child(div_9), 2);
			var node_5 = $.child(div_10);

			Supabase(node_5, { class: 'size-3.5' });
			$.reset(div_10);

			var div_11 = $.sibling(div_10, 2);
			var node_6 = $.child(div_11);

			Firebase(node_6, { class: 'size-3.5' });
			$.reset(div_11);
			$.reset(div_9);
			$.reset(div_2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 2);

	Card(node_7, {
		variant: 'outline',
		class: 'row-span-2 grid grid-rows-subgrid overflow-hidden',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div_12 = $.sibling($.first_child(fragment_1), 2);

			$.set_attribute(div_12, 'aria-hidden', true);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Card(node_8, {
		variant: 'outline',
		class: 'row-span-2 grid grid-rows-subgrid overflow-hidden',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var div_13 = $.sibling($.first_child(fragment_2), 2);

			$.set_attribute(div_13, 'aria-hidden', true);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Card(node_9, {
		variant: 'outline',
		class: 'row-span-2 grid grid-rows-subgrid',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var div_14 = $.sibling($.first_child(fragment_3), 2);
			var node_10 = $.child(div_14);

			Shield(node_10, {
				class: 'absolute inset-0 top-2.5 size-full stroke-[0.1px] opacity-15'
			});

			var node_11 = $.sibling(node_10, 2);

			Shield(node_11, { class: 'size-32 stroke-[0.1px]' });
			$.reset(div_14);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}