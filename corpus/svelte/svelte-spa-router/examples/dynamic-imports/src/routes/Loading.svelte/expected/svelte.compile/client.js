import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2>Loading…</h2> <p>We're loading the route! Please wait 5 seconds.</p> <p> </p>`, 1);

export default function Loading($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 4);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Here's your message: ${($$props.params && $$props.params.message) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}