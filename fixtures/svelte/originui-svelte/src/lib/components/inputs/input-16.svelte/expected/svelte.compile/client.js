import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative flex rounded-lg shadow-xs shadow-black/[.04]"><span class="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm">€</span> <!> <span class="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-e-lg border px-3 text-sm">EUR</span></div></div>`);

export default function Input_16($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with inline start and end add-on');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: '-me-px rounded-e-none ps-6 shadow-none',
		placeholder: '0.00',
		type: 'text'
	});

	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}