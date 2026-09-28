import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Hr } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Gradient($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Hr(node, {
		classes: { bg: "h-2 bg-gradient-to-r from-pink-500 to-indigo-500" }
	});

	var node_1 = $.sibling(node, 2);

	Hr(node_1, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Hr(node_2, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Hr(node_3, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400"
		}
	});

	var node_4 = $.sibling(node_3, 2);

	Hr(node_4, {
		classes: {
			bg: "h-2 border-0 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400"
		}
	});

	$.append($$anchor, fragment);
}