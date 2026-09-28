import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Label from '$lib/components/ui/label.svelte';

var root = $.from_html(`I agree to the <a class="underline" href="https://originui.com" target="_blank" rel="noopener noreferrer">terms of service</a>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);

export default function Checkbox_07($$anchor) {
	const uid = $.props_id();
	var div = root_1();
	var node = $.child(div);

	Checkbox(node, {
		get id() {
			return uid;
		}
	});

	var node_1 = $.sibling(node, 2);

	Label(node_1, {
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

	$.reset(div);
	$.append($$anchor, div);
}