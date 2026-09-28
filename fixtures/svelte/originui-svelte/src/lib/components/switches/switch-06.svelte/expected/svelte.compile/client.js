import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import Switch from '$lib/components/ui/switch.svelte';

var root = $.from_html(`<div class="inline-flex items-center gap-2"><!> <!></div>`);

export default function Switch_06($$anchor) {
	const uid = $.props_id();
	var div = root();
	var node = $.child(div);

	Switch(node, {
		get id() {
			return uid;
		},
		class: '[&_span]:border-input h-3 w-9 border-none [&_span]:border'
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('M2-style switch');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}