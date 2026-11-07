import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 26, () => list, (item) => item, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, item));
		$.animation(li, () => flip, null);
		$.append($$anchor, li);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 26, () => list, (item) => item, ($$anchor, item) => {
		var li_1 = root();
		var text_1 = $.only_child(li_1, true);

		$.template_effect(() => $.set_text(text_1, item));
		$.animation(li_1, () => flip, () => ({ delay: 500 }));
		$.append($$anchor, li_1);
	});

	$.append($$anchor, fragment);
}