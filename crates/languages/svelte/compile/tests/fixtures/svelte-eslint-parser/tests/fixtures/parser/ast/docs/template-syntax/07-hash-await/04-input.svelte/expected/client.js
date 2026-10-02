import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function _4_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => promise, null, ($$anchor, value) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `The value is ${$.get(value) ?? ''}`));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}