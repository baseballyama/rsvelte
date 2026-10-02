import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="">a</button> <button type="">a</button> <button type="button">a</button> <button type="foo">a</button> <button>a</button> <button>a</button> <button>a</button>`, 1);

export default function Lint_edge($$anchor, $$props) {
	function f(a, b) {
		return b;
	}
	const g = (x = 1) => 0;
	let c = 0;
	c = c + 1;
	let d = 1;
	function h() {
		h();
	}
	f;
	g;
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 8);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	$.set_attribute(button_2, 'type', type);
	$.template_effect(() => {
		$.set_attribute(button, 'type', $$props.label);
		$.set_attribute(button_1, 'type', `a${$$props.label ?? ''}`);
	});
	$.append($$anchor, fragment);
}
