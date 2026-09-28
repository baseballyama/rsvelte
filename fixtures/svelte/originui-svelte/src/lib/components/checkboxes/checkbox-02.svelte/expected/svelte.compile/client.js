import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);

export default function Checkbox_02($$anchor) {
	const uid = $.props_id();
	let checked = $.state(false);
	var div = root();
	var node = $.child(div);

	Checkbox(node, {
		get id() {
			return uid;
		},
		indeterminate: true,
		get checked() {
			return $.get(checked);
		},

		set checked($$value) {
			$.set(checked, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Indeterminate checkbox');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}