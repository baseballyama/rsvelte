import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HeaderOne from "$lib/components/veil/header/header-one.svelte";
import { Button } from "$lib/components/ui/veil/button";
import { Card } from "$lib/components/ui/veil/card";

import {
	Clerk,
	Claude,
	Figma,
	Firebase,
	Linear,
	Slack,
	Supabase,
	Twilio,
	Vercel
} from "$lib/svgs";

import ChevronRight from "@lucide/svelte/icons/chevron-right";

var root = $.from_html(`<span class="text-nowrap">Start Building</span> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Supabase</span>`, 1);
var root_2 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Slack</span>`, 1);
var root_3 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Figma</span>`, 1);
var root_4 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Vercel</span>`, 1);
var root_5 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Firebase</span>`, 1);
var root_6 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Linear</span>`, 1);
var root_7 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Twilio</span>`, 1);
var root_8 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Claude AI</span>`, 1);
var root_9 = $.from_html(`<!> <span class="font-medium text-nowrap max-sm:text-xs">Clerk</span>`, 1);
var root_10 = $.from_html(`<!> <main class="overflow-hidden"><section class="bg-background"><div class="relative py-32 md:pt-44"><div class="absolute inset-0 aspect-square mask-t-from-50% mask-radial-[75%_100%] mask-radial-from-45% mask-radial-to-75% mask-radial-at-top lg:top-24 lg:aspect-9/4 dark:opacity-5"><img src="https://images.unsplash.com/photo-1740516367177-ae20098c8786?q=80&amp;w=2268&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="hero background" width="2268" height="1740" class="size-full object-cover object-top"/></div> <div class="relative z-10 mx-auto w-full max-w-5xl px-6"><div class="mx-auto max-w-md text-center"><h1 class="font-serif text-4xl font-medium text-balance sm:text-5xl">Ship faster. Integrate smarter.</h1> <p class="mt-4 text-balance text-muted-foreground">Veil is your all-in-one engine for adding seamless integrations to your app.</p> <!></div> <div class="mx-auto mt-24 max-w-xl"><div class="grid scale-95 grid-cols-3 gap-12 **:fill-foreground"><div class="ml-auto blur-[2px]"><!></div> <div class="ml-auto"><!></div> <div class="ml-auto blur-[2px]"><!></div> <div class="mr-auto"><!></div> <div class="blur-[2px]"><!></div> <div><!></div> <div class="ml-auto blur-[2px]"><!></div> <div><!></div> <div class="blur-[2px]"><!></div></div></div></div></div></section></main>`, 1);

export default function Hero_one($$anchor) {
	var fragment = root_10();
	var node = $.first_child(fragment);

	HeaderOne(node, {});

	var main = $.sibling(node, 2);
	var section = $.child(main);
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);
	var div_2 = $.child(div_1);
	var node_1 = $.sibling($.child(div_2), 4);

	Button(node_1, {
		class: 'mt-6 pr-1.5',
		href: '#link',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

			ChevronRight(node_2, { class: 'opacity-50' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var node_3 = $.child(div_5);

	Card(node_3, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			Supabase(node_4, { class: 'size-4' });
			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_5 = $.child(div_6);

	Card(node_5, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_6 = $.first_child(fragment_3);

			Slack(node_6, { class: 'size-4' });
			$.next(2);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_7 = $.child(div_7);

	Card(node_7, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_3();
			var node_8 = $.first_child(fragment_4);

			Figma(node_8, { class: 'size-4' });
			$.next(2);
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_9 = $.child(div_8);

	Card(node_9, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_4();
			var node_10 = $.first_child(fragment_5);

			Vercel(node_10, { class: 'size-4' });
			$.next(2);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_11 = $.child(div_9);

	Card(node_11, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_5();
			var node_12 = $.first_child(fragment_6);

			Firebase(node_12, { class: 'size-3 sm:size-4' });
			$.next(2);
			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_13 = $.child(div_10);

	Card(node_13, {
		class: 'mx-a flex h-8 h-10 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_6();
			var node_14 = $.first_child(fragment_7);

			Linear(node_14, { class: 'size-3 sm:size-4' });
			$.next(2);
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);

	var div_11 = $.sibling(div_10, 2);
	var node_15 = $.child(div_11);

	Card(node_15, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_7();
			var node_16 = $.first_child(fragment_8);

			Twilio(node_16, { class: 'size-3 sm:size-4' });
			$.next(2);
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_17 = $.child(div_12);

	Card(node_17, {
		class: 'mx-a flex h-8 h-10 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_8();
			var node_18 = $.first_child(fragment_9);

			Claude(node_18, { class: 'size-3 sm:size-4' });
			$.next(2);
			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(div_12);

	var div_13 = $.sibling(div_12, 2);
	var node_19 = $.child(div_13);

	Card(node_19, {
		class: 'flex h-8 w-fit items-center gap-2 rounded-xl px-3 shadow-foreground/10 sm:h-10 sm:px-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_9();
			var node_20 = $.first_child(fragment_10);

			Clerk(node_20, { class: 'size-3 sm:size-4' });
			$.next(2);
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(div_13);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.reset(main);
	$.append($$anchor, fragment);
}