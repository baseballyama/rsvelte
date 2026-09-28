import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="[*:not(:first-child)]:mt-2"><div class="mb-2 flex justify-between gap-1"><!> <span class="text-muted-foreground text-sm">Optional</span></div> <!></div>`);

export default function Input_04($$anchor) {
	const uid = $.props_id();
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		get for() {
			return uid;
		},
		class: 'leading-6',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with hint');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	Input(node_1, {
		get id() {
			return uid;
		},
		placeholder: 'Email',
		type: 'email'
	});

	$.reset(div);
	$.append($$anchor, div);
}