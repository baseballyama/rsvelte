import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <p id="timestamp"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => {
		$.set_text(text, $$props.data.message);
		$.set_text(text_1, $$props.data.timestamp);
	});

	$.append($$anchor, fragment);
	$.pop();
}