import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <!> <!>`, 1);

export default function Input_1($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);

	$.bind_this(div, set, null);

	var div_1 = $.sibling(div, 2);

	$.bind_this(div_1, (new_v) => v = new_v, null);

	var node = $.sibling(div_1, 2);

	$.bind_this(Input(node, {}), set, null);

	var node_1 = $.sibling(node, 2);

	$.bind_this(Input(node_1, {}), (new_v) => v = new_v, null);
	$.append($$anchor, fragment);
}