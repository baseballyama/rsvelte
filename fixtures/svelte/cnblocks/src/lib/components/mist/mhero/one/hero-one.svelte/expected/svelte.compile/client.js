import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import CirclePlay from "@lucide/svelte/icons/circle-play";
import Header from "./header.svelte";

var root = $.from_html(`Get Started <!>`, 1);
var root_1 = $.from_html(`<!> Watch Video`, 1);

var root_2 = $.from_html(
	`<!> <main class="overflow-hidden [--color-primary:var(--color-indigo-500)]"><section class="bg-linear-to-b from-background to-muted"><div class="relative py-36"><div class="relative z-10 mx-auto w-full max-w-5xl px-6"><div class="md:w-1/2"><div><h1 class="max-w-md text-5xl font-medium text-balance md:text-6xl">Simple payments for startups</h1> <p class="my-8 max-w-2xl text-xl text-balance text-muted-foreground">One tool that does it all. Search, generate, analyze, and chat—right
							inside Tailark.</p> <div class="flex items-center gap-3"><!> <!></div></div> <div class="mt-10"><p class="text-muted-foreground">Trusted by teams at :</p> <div class="mt-6 grid max-w-sm grid-cols-3 gap-6"><div class="flex"><img class="h-4 w-fit" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto"/></div> <div class="flex"><img class="h-5 w-fit" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto"/></div> <div class="flex"><img class="h-4 w-fit" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto"/></div></div></div></div></div> <div class="mt-24 translate-x-12 perspective-near md:absolute md:top-40 md:-right-6 md:bottom-16 md:left-1/2 md:mt-0 md:translate-x-0"><div class="relative h-full before:absolute before:-inset-x-4 before:top-0 before:bottom-7 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border before:border-foreground/5 before:bg-foreground/5"><div class="relative h-full -translate-y-12 skew-x-6 overflow-hidden rounded-(--radius) border border-transparent bg-background shadow-md ring-1 shadow-foreground/10"><img src="/mist/tailark.png" alt="app screen" width="2880" height="1842" class="size-full object-cover object-top-left"/></div></div></div></div></section></main>`,
	1
);

export default function Hero_one($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Header(node, {});

	var main = $.sibling(node, 2);
	var section = $.child(main);
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var div_4 = $.sibling($.child(div_3), 4);
	var node_1 = $.child(div_4);

	Button(node_1, {
		variant: 'mdefault',
		size: 'lg',
		class: 'pr-4.5',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node_2 = $.sibling($.first_child(fragment_1));

			ChevronRight(node_2, { class: 'opacity-50' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Button(node_3, {
		href: '/',
		size: 'lg',
		variant: 'outline',
		class: 'pl-5',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			CirclePlay(node_4, { class: 'fill-primary/25 stroke-primary' });
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_3);
	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.next(2);
	$.reset(div);
	$.reset(section);
	$.reset(main);
	$.append($$anchor, fragment);
}