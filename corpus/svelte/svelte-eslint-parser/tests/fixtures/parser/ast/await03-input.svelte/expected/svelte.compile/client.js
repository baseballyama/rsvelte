import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Await03_input($$anchor, $$props) {
	$.push($$props, true);

	let expression = new Promise();
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(node, () => expression, ($$anchor) => {}, ($$anchor) => {}, ($$anchor) => {});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => expression, ($$anchor) => {}, ($$anchor) => {});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => expression, ($$anchor) => {}, void 0, ($$anchor) => {});
	$.append($$anchor, fragment);
	$.pop();
}