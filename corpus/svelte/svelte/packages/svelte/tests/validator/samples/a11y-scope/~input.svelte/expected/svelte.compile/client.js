import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<th scope=""></th> <!> <div scope=""></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.element(node, () => Math.random() ? 'th' : 'td', false, ($$element, $$anchor) => {
		$.attribute_effect($$element, () => ({ scope: true }));
	});

	$.next(2);
	$.append($$anchor, fragment);
}