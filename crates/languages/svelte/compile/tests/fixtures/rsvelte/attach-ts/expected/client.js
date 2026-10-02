import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>sized</p> <button>+</button> <div></div> <span></span>`, 1);

export default function Attach_ts($$anchor) {
	let size = $.state(12);
	const grow = (node) => {
		node.style.fontSize = `${$.get(size)}px`;
	};
	function label(text) {
		return (node) => {
			node.ariaLabel = text;
		};
	}
	var fragment = root();
	var p = $.first_child(fragment);
	$.attach(p, () => grow);
	var button = $.sibling(p, 2);
	$.attach(button, () => label('grow'));
	var div = $.sibling(button, 2);
	$.attach(div, () => (node) => node.scrollTo(0, $.get(size)));
	var span = $.sibling(div, 2);
	$.attach(span, () => label($.get(size)));
	$.delegated('click', button, () => $.set(size, $.get(size) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
