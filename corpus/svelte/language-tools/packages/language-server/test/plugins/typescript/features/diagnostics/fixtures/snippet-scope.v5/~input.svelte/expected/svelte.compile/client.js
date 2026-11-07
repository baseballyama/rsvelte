import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const top = ($$anchor) => {};
var root = $.from_html(`<div><!></div>  <!>`, 1);

export default function Input($$anchor) {
	// no error
	top;

	var fragment = root();
	var div = $.first_child(fragment);

	{
		const nested1 = ($$anchor) => {};
		var node = $.child(div);

		nested1(node);
		$.reset(div);
	}

	var node_1 = $.sibling(div, 2);

	$.snippet(node_1, () => nested1);
	$.append($$anchor, fragment);
}