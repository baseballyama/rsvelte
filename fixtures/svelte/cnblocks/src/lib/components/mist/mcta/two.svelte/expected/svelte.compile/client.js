import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_html(`<section class="[--color-primary:var(--color-indigo-500)]"><div class="py-12"><div class="mx-auto max-w-5xl px-6"><div class="flex flex-wrap items-center justify-between gap-6"><div><h2 class="text-3xl font-semibold text-balance text-foreground lg:text-4xl">Build 10x Faster with Mist</h2></div> <div class="flex justify-end gap-3"><!> <!></div></div></div></div></section>`);

export default function Two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var node = $.child(div_3);

	Button(node, {
		href: '/',
		variant: 'outline',
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get a Demo');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		href: '/',
		size: 'lg',
		variant: 'mdefault',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Get Started');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}