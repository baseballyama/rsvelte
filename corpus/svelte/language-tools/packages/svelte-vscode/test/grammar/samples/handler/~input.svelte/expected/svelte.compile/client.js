import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling(div, 2);

	Component(node, { $$events: { click: (e) => console.log(e) } });
	$.event('click', div, (e) => console.log(e));
	$.append($$anchor, fragment);
}