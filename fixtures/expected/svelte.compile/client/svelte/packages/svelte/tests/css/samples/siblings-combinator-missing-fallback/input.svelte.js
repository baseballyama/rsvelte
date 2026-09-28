import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<y>fallback content</y>`);
var root_1 = $.from_html(`<x class="svelte-w5lgmd"></x> <!> <z class="svelte-w5lgmd">this should be green if the slot fallback is not rendered</z>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var y = root();

		$.append($$anchor, y);
	});

	$.next(2);
	$.append($$anchor, fragment);
}