import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div></div> <div></div> <!> <div></div> <div></div>`, 1);

export default function Main($$anchor) {
	/**
	 * @param {Element} [node]
	 * @param {any} [options]
	 */
	const fn = (node, options) => ({});

	let a = { b: { 'c-d': fn } };
	let directive = $.derived(() => a);
	var fragment = root_1();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => $.get(directive).b['c-d']?.($$node));

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling(div_1, 2);

	$.each(node_1, 24, () => [], (i) => i, ($$anchor, i) => {
		var div_2 = root();

		$.animation(div_2, () => $.get(directive).b['c-d'], null);
		$.append($$anchor, div_2);
	});

	var div_3 = $.sibling(node_1, 2);
	var div_4 = $.sibling(div_3, 2);

	$.transition(3, div_1, () => $.get(directive).b['c-d']);
	$.transition(1, div_3, () => $.get(directive).b['c-d']);
	$.transition(2, div_4, () => $.get(directive).b['c-d']);
	$.append($$anchor, fragment);
}