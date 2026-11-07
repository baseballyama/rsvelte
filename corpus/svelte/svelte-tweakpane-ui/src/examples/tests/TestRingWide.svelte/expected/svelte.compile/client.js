import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Ring } from '$lib';

var root = $.from_html(`<!> <!> <pre> </pre>`, 1);

export default function TestRingWide($$anchor) {
	let value = 0;
	let wide = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Ring(node, {
		label: 'Ring 1',
		get wide() {
			return wide;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		label: 'Wide',
		get value() {
			return wide;
		},

		set value($$value) {
			wide = $$value;
		}
	});

	var pre = $.sibling(node_1, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Value: ${value ?? ''}`));
	$.append($$anchor, fragment);
}