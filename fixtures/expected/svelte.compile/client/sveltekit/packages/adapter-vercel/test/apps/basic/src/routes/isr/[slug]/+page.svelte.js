import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <p id="rendered-at"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => {
		$.set_text(text, `ISR: ${$$props.data.slug ?? ''}`);
		$.set_text(text_1, $$props.data.rendered_at);
	});

	$.append($$anchor, fragment);
	$.pop();
}