import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function _5_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => promise, null, void 0, ($$anchor, error) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `The error is ${$.get(error) ?? ''}`));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}