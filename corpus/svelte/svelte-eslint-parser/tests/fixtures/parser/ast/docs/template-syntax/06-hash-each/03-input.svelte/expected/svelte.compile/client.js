import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

export default function _3_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item, i) => {
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `${i + 1}: ${item.name ?? ''} x ${item.qty ?? ''}`));
		$.append($$anchor, li);
	});

	$.append($$anchor, fragment);
}