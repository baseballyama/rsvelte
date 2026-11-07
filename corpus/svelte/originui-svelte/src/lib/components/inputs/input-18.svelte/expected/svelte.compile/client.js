import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="flex rounded-lg shadow-xs shadow-black/[.04]"><!> <div class="relative"><select class="peer border-input bg-background text-muted-foreground ring-offset-background hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 inline-flex h-full appearance-none items-center rounded-e-lg border ps-3 pe-8 text-sm transition-shadow focus:z-10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" aria-label="Domain suffix"><option>.com</option><option>.org</option><option>.net</option></select> <span class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-px flex h-full w-9 items-center justify-center peer-disabled:opacity-50"><!></span></div></div></div>`);

export default function Input_18($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with end select');

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
		class: '-me-px rounded-e-none shadow-none focus-visible:z-10',
		placeholder: 'google',
		type: 'text'
	});

	var div_2 = $.sibling(node_1, 2);
	var span = $.sibling($.child(div_2), 2);
	var node_2 = $.child(span);

	ChevronDown(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(span);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}