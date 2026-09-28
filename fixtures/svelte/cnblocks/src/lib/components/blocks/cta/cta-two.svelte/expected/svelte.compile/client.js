import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/components/ui/button/button.svelte";

var root = $.from_html(`<section class="py-16"><div class="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32"><div class="text-center"><h2 class="text-4xl font-semibold text-balance lg:text-5xl">Start Building</h2> <p class="mt-4">Libero sapiente aliquam quibusdam aspernatur.</p> <div class="mt-12 flex flex-wrap justify-center gap-4"><!> <!></div></div></div></section>`);

export default function Cta_two($$anchor) {
	var section = root();
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 4);
	var node = $.child(div_2);

	Button(node, {
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Get Started');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		size: 'lg',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Book Demo');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}