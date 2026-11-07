import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteComponentTyped } from 'svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	let Component;

	function log(message) {}

	var fragment = root();
	var node = $.first_child(fragment);

	Component(node, {
		$$events: {
			click: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, { $$events: { click: (e) => log(e) } });
	$.append($$anchor, fragment);
}