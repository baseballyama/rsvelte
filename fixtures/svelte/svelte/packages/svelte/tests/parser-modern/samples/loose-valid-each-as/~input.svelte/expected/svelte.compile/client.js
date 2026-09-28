import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Input($$anchor) {
	let arr = [];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => arr, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 2));
		let key = () => $.get($$array)[0];
		let value = $.derived_safe_equal(() => $.fallback($.get($$array)[1], 'default'));
		var div = root();
		var text = $.only_child(div);

		$.template_effect(() => $.set_text(text, `${key() ?? ''}: ${$.get(value) ?? ''}`));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}