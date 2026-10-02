import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>static</div> <p> </p> <button>add</button> <span></span>`, 1);

export default function Attach($$anchor) {
	let count = $.state(0);
	function tooltip(node) {
		node.title = 'hi';
		return () => {
			node.title = '';
		};
	}
	function color(c) {
		return (node) => {
			node.style.color = c;
		};
	}
	var fragment = root();
	var div = $.first_child(fragment);
	$.attach(div, () => tooltip);
	var p = $.sibling(div, 2);
	var text = $.only_child(p, true);
	$.attach(p, () => color($.get(count) > 0 ? 'red' : 'blue'));
	var button = $.sibling(p, 2);
	$.attach(button, () => (node) => node.focus());
	var span = $.sibling(button, 2);
	$.attach(span, () => tooltip);
	$.attach(span, () => color('green'));
	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
