import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => foo, $.index, ($$anchor, bar) => {
		var span = root();
		var text = $.only_child(span, true);

		$.template_effect(() => $.set_text(text, bar));
		$.append($$anchor, span);
	});

	$.append($$anchor, fragment);
}