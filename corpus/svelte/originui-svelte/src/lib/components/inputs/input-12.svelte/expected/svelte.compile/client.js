import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <span class="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">.com</span></div></div>`);

export default function Input_12($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with end inline add-on');

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
		class: 'peer pe-12',
		placeholder: 'google',
		type: 'text'
	});

	$.next(2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}