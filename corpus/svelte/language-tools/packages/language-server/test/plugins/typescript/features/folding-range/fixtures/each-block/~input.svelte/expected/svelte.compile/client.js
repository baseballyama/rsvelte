import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => items, $.index, ($$anchor, item) => {
		$.next();

		var text_1 = $.text();

		$.template_effect(() => $.set_text(text_1, item));
		$.append($$anchor, text_1);
	});

	$.append($$anchor, fragment);
}