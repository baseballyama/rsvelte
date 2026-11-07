import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<h1>Shopping list</h1> <ul></ul>`, 1);

export default function _2_input($$anchor) {
	var fragment = root_1();
	var ul = $.sibling($.first_child(fragment), 2);

	$.each(ul, 20, () => items, $.index, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `${item.name ?? ''} x ${item.qty ?? ''}`));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, fragment);
}