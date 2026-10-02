import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Events from '../$$events/input.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Events(node, {
		$$events: { click: (e) => e, foo: (e) => e.detail === 'bar' }
	});

	var node_1 = $.sibling(node, 2);

	Events(node_1, { $$events: { bar: (e) => e, foo: (e) => e.detail === true } });
	$.append($$anchor, fragment);
}