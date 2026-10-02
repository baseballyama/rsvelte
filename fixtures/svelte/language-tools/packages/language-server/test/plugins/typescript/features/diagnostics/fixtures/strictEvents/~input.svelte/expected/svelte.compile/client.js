import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import StrictEvents from './strictEvents.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	StrictEvents(node, { $$events: { foo: (e) => e, click: (e) => e } });

	var node_1 = $.sibling(node, 2);

	StrictEvents(node_1, { $$events: { bar: (e) => e } });
	$.append($$anchor, fragment);
}