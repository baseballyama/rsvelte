import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import Search from '@lucide/svelte/icons/search';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"><!></div> <button class="text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-px end-px flex h-full w-9 items-center justify-center rounded-e-lg transition-shadow focus-visible:border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Submit search" type="submit"><!></button></div></div>`);

export default function Input_26($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Search input with icon and button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: 'peer ps-9 pe-9',
		placeholder: 'Search...',
		type: 'search'
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	Search(node_2, { size: 16 });
	$.reset(div_2);

	var button = $.sibling(div_2, 2);
	var node_3 = $.child(button);

	ArrowRight(node_3, { size: 16, 'aria-hidden': 'true' });
	$.reset(button);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}