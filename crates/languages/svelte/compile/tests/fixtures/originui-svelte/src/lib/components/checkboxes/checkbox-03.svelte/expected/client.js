import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);

export default function Checkbox_03($$anchor) {
	const uid = $.props_id();
	var div = root();

	$.set_style(div, '', {}, {
		'--primary': '238.7 83.5% 66.7%',
		'--ring': '238.7 83.5% 66.7%'
	});

	var node = $.child(div);

	Checkbox(node, {
		get id() {
			return uid;
		},
		checked: true
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Colored checkbox');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}