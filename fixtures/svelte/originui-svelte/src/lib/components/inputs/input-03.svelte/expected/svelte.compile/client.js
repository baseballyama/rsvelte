import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <!> <p class="text-muted-foreground text-xs" role="region" aria-live="polite">We won't share your email with anyone</p></div>`);

export default function Input_03($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with helper text');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		get id() {
			return uid;
		},
		placeholder: 'Email',
		type: 'email'
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
}