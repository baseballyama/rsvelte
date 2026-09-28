import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Card from "$lib/components/ui/card/card.svelte";
import Button from "$lib/components/ui/button/button.svelte";
import Check from "@lucide/svelte/icons/check";

var root = $.from_html(`<li class="flex items-center gap-2"><!> <span> </span></li>`);

var root_1 = $.from_html(`<div class="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0"><div class="pb-12 text-center md:pr-12 md:pb-0"><h3 class="text-2xl font-semibold">Suite Enterprise</h3> <p class="mt-2 text-lg">For your company of any size</p> <span class="mt-12 mb-6 inline-block text-6xl font-bold"><span class="text-4xl">$</span>234</span> <div class="flex justify-center"><!></div> <p class="mt-12 text-sm text-muted-foreground">Includes : Security, Unlimited Storage, Payment, Search engine, and all
							features</p></div> <div class="relative"><ul role="list" class="space-y-4"></ul> <p class="mt-6 text-sm text-muted-foreground">Team can be any size, and you can add or switch members as needed.
							Companies using our platform include:</p> <div class="mt-12 flex flex-wrap items-center justify-between gap-6"><img class="h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nvidia.svg" alt="Nvidia Logo" height="20" width="auto"/> <img class="h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/column.svg" alt="Column Logo" height="16" width="auto"/> <img class="h-4 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/github.svg" alt="GitHub Logo" height="16" width="auto"/> <img class="h-5 w-fit dark:invert" src="https://html.tailus.io/blocks/customers/nike.svg" alt="Nike Logo" height="20" width="auto"/></div></div></div>`);

var root_2 = $.from_html(`<div class="relative bg-muted py-16 [--color-primary:var(--color-indigo-500)] md:py-32 dark:bg-muted/30"><div class="mx-auto max-w-5xl px-6"><div class="mx-auto max-w-2xl text-center"><h2 class="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">Pricing that scale with your business</h2> <p class="mx-auto mt-4 max-w-md text-lg text-balance text-muted-foreground">Choose the perfect plan for your needs and start optimizing your workflow today</p></div> <div class="mt-8 md:mt-16"><!></div></div></div>`);

export default function One($$anchor) {
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	Card(node, {
		class: 'relative',
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_1();
			var div_4 = $.child(div_3);
			var div_5 = $.sibling($.child(div_4), 6);
			var node_1 = $.child(div_5);

			Button(node_1, {
				variant: 'mdefault',
				size: 'lg',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Get started');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div_5);
			$.next(2);
			$.reset(div_4);

			var div_6 = $.sibling(div_4, 2);
			var ul = $.child(div_6);

			$.each(
				ul,
				20,
				() => [
					"First premium advantage",
					"Second advantage weekly",
					"Third advantage donate to project",
					"Fourth, access to all components weekly"
				],
				$.index,
				($$anchor, item) => {
					var li = root();
					var node_2 = $.child(li);

					Check(node_2, { class: 'size-3 text-primary', strokeWidth: 3.5 });

					var span = $.sibling(node_2, 2);
					var text_1 = $.only_child(span, true);

					$.reset(li);
					$.template_effect(() => $.set_text(text_1, item));
					$.append($$anchor, li);
				}
			);

			$.reset(ul);
			$.next(4);
			$.reset(div_6);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}