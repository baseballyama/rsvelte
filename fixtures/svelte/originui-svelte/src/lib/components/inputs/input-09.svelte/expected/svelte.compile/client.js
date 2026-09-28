import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import AtSign from '@lucide/svelte/icons/at-sign';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"><!></div></div></div>`);

export default function Input_09($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with start icon');

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
		class: 'peer ps-9',
		placeholder: 'Email',
		type: 'email'
	});

	var div_2 = $.sibling(node_1, 2);
	var node_2 = $.child(div_2);

	AtSign(node_2, { size: 16, 'aria-hidden': 'true' });
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}