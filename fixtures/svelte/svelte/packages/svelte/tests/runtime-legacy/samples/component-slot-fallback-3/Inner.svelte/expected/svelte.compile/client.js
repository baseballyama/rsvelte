import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div> <div>world</div> <div>Bye</div> <div>World</div>`, 1);

export default function Inner($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, ($$anchor) => {
		var fragment_1 = root();

		$.next(6);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}