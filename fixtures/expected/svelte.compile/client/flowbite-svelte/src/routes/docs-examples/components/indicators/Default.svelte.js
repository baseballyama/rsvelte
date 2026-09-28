import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Default($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Indicator(node, { color: 'gray' });

	var node_1 = $.sibling(node, 2);

	Indicator(node_1, { color: 'secondary' });

	var node_2 = $.sibling(node_1, 2);

	Indicator(node_2, { color: 'orange' });

	var node_3 = $.sibling(node_2, 2);

	Indicator(node_3, { color: 'blue' });

	var node_4 = $.sibling(node_3, 2);

	Indicator(node_4, { color: 'green' });

	var node_5 = $.sibling(node_4, 2);

	Indicator(node_5, { color: 'red' });

	var node_6 = $.sibling(node_5, 2);

	Indicator(node_6, { color: 'purple' });

	var node_7 = $.sibling(node_6, 2);

	Indicator(node_7, { color: 'indigo' });

	var node_8 = $.sibling(node_7, 2);

	Indicator(node_8, { color: 'yellow' });

	var node_9 = $.sibling(node_8, 2);

	Indicator(node_9, { color: 'teal' });
	$.append($$anchor, fragment);
}