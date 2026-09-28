import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <!> <p class="text-destructive text-xs" role="alert" aria-live="polite">Email is invalid</p></div>`);

export default function Input_06($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with error');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: 'border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/30',
		placeholder: 'Email',
		type: 'email',
		value: 'invalid@email.com'
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}