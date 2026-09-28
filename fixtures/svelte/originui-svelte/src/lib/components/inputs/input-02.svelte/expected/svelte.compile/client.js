import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`Required input <span class="text-destructive">*</span>`, 1);
var root_1 = $.from_html(`<div class="*:not-first:mt-2"><!> <!></div>`);

export default function Input_02($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		get id() {
			return uid;
		},
		placeholder: 'Email',
		type: 'email',
		required: true
	});

	$.reset(div);
	$.append($$anchor, div);
}