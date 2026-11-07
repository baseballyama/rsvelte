import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		var div = root();
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}