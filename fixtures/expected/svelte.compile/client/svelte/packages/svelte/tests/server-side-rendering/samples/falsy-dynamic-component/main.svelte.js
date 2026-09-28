import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Test</h1> <!>`, 1);

export default function Main($$anchor) {
	let Component = void 0;
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.component(node, () => Component, ($$anchor, Component_1) => {
		Component_1($$anchor, {});
	});

	$.append($$anchor, fragment);
}