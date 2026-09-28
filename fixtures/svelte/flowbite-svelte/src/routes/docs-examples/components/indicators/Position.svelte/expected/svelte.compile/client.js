import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator } from "flowbite-svelte";

var root = $.from_html(`<div class="borer relative h-56 w-56 rounded-lg border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"><!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Position($$anchor) {
	var div = root();
	var node = $.child(div);

	Indicator(node, { placement: 'top-left', color: 'primary' });

	var node_1 = $.sibling(node, 2);

	Indicator(node_1, { placement: 'top-center', color: 'secondary' });

	var node_2 = $.sibling(node_1, 2);

	Indicator(node_2, { placement: 'top-right', color: 'orange' });

	var node_3 = $.sibling(node_2, 2);

	Indicator(node_3, { placement: 'center-left', color: 'green' });

	var node_4 = $.sibling(node_3, 2);

	Indicator(node_4, { placement: 'center', color: 'red' });

	var node_5 = $.sibling(node_4, 2);

	Indicator(node_5, { placement: 'center-right', color: 'purple' });

	var node_6 = $.sibling(node_5, 2);

	Indicator(node_6, { placement: 'bottom-left', color: 'indigo' });

	var node_7 = $.sibling(node_6, 2);

	Indicator(node_7, { placement: 'bottom-center', color: 'yellow' });

	var node_8 = $.sibling(node_7, 2);

	Indicator(node_8, { placement: 'bottom-right', color: 'teal' });
	$.reset(div);
	$.append($$anchor, div);
}