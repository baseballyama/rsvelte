import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Star } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Stars($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Star(node, { size: 30, iconIndex: 0, fillPercent: 0 });

	var node_1 = $.sibling(node, 2);

	Star(node_1, { size: 30, iconIndex: 10, fillPercent: 10 });

	var node_2 = $.sibling(node_1, 2);

	Star(node_2, { size: 30, iconIndex: 20, fillPercent: 20 });

	var node_3 = $.sibling(node_2, 2);

	Star(node_3, { size: 30, iconIndex: 30, fillPercent: 30 });

	var node_4 = $.sibling(node_3, 2);

	Star(node_4, { size: 30, iconIndex: 40, fillPercent: 40 });

	var node_5 = $.sibling(node_4, 2);

	Star(node_5, { size: 30, iconIndex: 50, fillPercent: 50 });

	var node_6 = $.sibling(node_5, 2);

	Star(node_6, { size: 30, iconIndex: 60, fillPercent: 60 });

	var node_7 = $.sibling(node_6, 2);

	Star(node_7, { size: 30, iconIndex: 70, fillPercent: 70 });

	var node_8 = $.sibling(node_7, 2);

	Star(node_8, { size: 30, iconIndex: 80, fillPercent: 80 });

	var node_9 = $.sibling(node_8, 2);

	Star(node_9, { size: 30, iconIndex: 90, fillPercent: 90 });

	var node_10 = $.sibling(node_9, 2);

	Star(node_10, { size: 30, iconIndex: 100, fillPercent: 100 });
	$.append($$anchor, fragment);
}