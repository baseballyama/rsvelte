import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

export default function _2_input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 26, () => list, (item) => item, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, item));
		$.animation(li, () => flip, null);
		$.append($$anchor, li);
	});

	$.append($$anchor, fragment);
}