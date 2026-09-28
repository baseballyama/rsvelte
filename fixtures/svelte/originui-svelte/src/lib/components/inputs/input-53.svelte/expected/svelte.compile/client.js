import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="*:not-first:mt-2"><!> <!></div>`);

export default function Input_53($$anchor) {
	var div = root();
	var node = $.child(div);

	Label(node, {
		for: 'input-52',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Read-only input');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		id: 'input-52',
		class: 'read-only:bg-muted',
		value: 'This is a read-only input',
		readonly: true,
		placeholder: 'Email',
		type: 'email'
	});

	$.reset(div);
	$.append($$anchor, div);
}