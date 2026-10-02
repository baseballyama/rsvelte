import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _4_input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, (item) => item.id, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `${item.name ?? ''} x ${item.qty ?? ''}`));
		$.append($$anchor, li);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 18, () => items, (item) => item.id, ($$anchor, item, i) => {
		var li_1 = root();
		var text_1 = $.only_child(li_1);

		$.template_effect(() => $.set_text(text_1, `${$.get(i) + 1}: ${item.name ?? ''} x ${item.qty ?? ''}`));
		$.append($$anchor, li_1);
	});

	$.append($$anchor, fragment);
}