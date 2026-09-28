import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="flex items-center justify-between gap-2"><!> <!></div>`);

export default function Checkbox_09($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Checkbox(node, {
		get id() {
			return uid;
		},
		class: 'order-1'
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Right aligned checkbox');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}