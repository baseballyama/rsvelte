import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>ISR Page</h1> <p id="rendered-at"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $$props.data.rendered_at));
	$.append($$anchor, fragment);
	$.pop();
}