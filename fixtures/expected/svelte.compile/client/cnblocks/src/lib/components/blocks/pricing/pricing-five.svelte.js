import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";
import { VercelFull, SupabaseFull, Spotify, Figma, FirebaseFull } from "$lib/svgs";

var root = $.from_html(`<li class="flex items-center gap-2"><!> <span> </span></li>`);

var root_1 = $.from_html(`<div class="relative py-16 md:py-32"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl text-center"><h2 class="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Start managing your company smarter today</h2></div> <div class="mt-8 md:mt-20"><div class="relative rounded-3xl border bg-card shadow-2xl shadow-zinc-950/5"><div class="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0"><div class="pb-12 text-center md:pr-12 md:pb-0"><h3 class="text-2xl font-semibold">Suite Enterprise</h3> <p class="mt-2 text-lg">For your company of any size</p> <span class="mt-12 mb-6 inline-block text-6xl font-bold"><span class="text-4xl">$</span>234</span> <div class="flex justify-center"><!></div> <p class="mt-12 text-sm text-muted-foreground">Includes : Security, Unlimited Storage, Payment, Search engine, and all
							features</p></div> <div class="relative"><ul role="list" class="space-y-4"></ul> <p class="mt-6 text-sm text-muted-foreground">Team can be any size, and you can add or switch members as needed.
							Companies using our platform include:</p> <div class="mt-12 flex flex-wrap items-center justify-between gap-6"><!> <!> <!> <!> <!></div></div></div></div></div></div></div>`);

export default function Pricing_five($$anchor) {
	let list = [
		"First premium advantage",
		"Second advantage weekly",
		"Third advantage donate to project",
		"Fourth, access to all components weekly"
	];

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var div_4 = $.child(div_3);
	var div_5 = $.child(div_4);
	var div_6 = $.sibling($.child(div_5), 6);
	var node = $.child(div_6);

	Button(node, {
		href: '/',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.next(2);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var ul = $.child(div_7);

	$.each(ul, 21, () => list, $.index, ($$anchor, item) => {
		var li = root();
		var node_1 = $.child(li);

		Check(node_1, { class: 'size-3' });

		var span = $.sibling(node_1, 2);
		var text_1 = $.only_child(span, true);

		$.reset(li);
		$.template_effect(() => $.set_text(text_1, $.get(item)));
		$.append($$anchor, li);
	});

	$.reset(ul);

	var div_8 = $.sibling(ul, 4);
	var node_2 = $.child(div_8);

	VercelFull(node_2, { class: 'h-5 w-fit dark:invert' });

	var node_3 = $.sibling(node_2, 2);

	SupabaseFull(node_3, { class: 'h-4 w-fit dark:invert' });

	var node_4 = $.sibling(node_3, 2);

	Spotify(node_4, { class: 'h-4 w-fit dark:invert' });

	var node_5 = $.sibling(node_4, 2);

	Figma(node_5, { class: 'h-5 w-fit dark:invert' });

	var node_6 = $.sibling(node_5, 2);

	FirebaseFull(node_6, { class: 'h-5 w-fit dark:invert' });
	$.reset(div_8);
	$.reset(div_7);
	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}