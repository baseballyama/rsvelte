import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="text"/> <textarea></textarea> <select></select> <div></div>`, 1);

export default function Bindings($$anchor) {
	let focused = $.state(false);
	var fragment = root();
	var input = $.first_child(fragment);
	var textarea = $.sibling(input, 2);
	var select = $.sibling(textarea, 2);
	var div = $.sibling(select, 2);

	$.bind_focused(input, ($$value) => $.set(focused, $$value));
	$.bind_focused(textarea, ($$value) => $.set(focused, $$value));
	$.bind_focused(select, ($$value) => $.set(focused, $$value));
	$.bind_focused(div, ($$value) => $.set(focused, $$value));
	$.append($$anchor, fragment);
}