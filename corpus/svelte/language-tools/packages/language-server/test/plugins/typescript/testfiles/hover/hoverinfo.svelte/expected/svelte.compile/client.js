import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import HoverEventsInterface from './hover-events-interface.svelte';

var root = $.from_html(`<!> <custom-element></custom-element>`, 3);

export default function Hoverinfo($$anchor) {
	/** Documentation string */
	const withDocs = true;

	const withoutDocs = true;

	/**@author foo */
	const withJsDocTag = true;

	var fragment = root();
	var node = $.first_child(fragment);

	HoverEventsInterface(node, { $$events: { abc: (e) => e } });

	var custom_element = $.sibling(node, 2);

	$.set_custom_element_data(custom_element, 'foo', 'bar');
	$.append($$anchor, fragment);
}