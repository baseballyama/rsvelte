import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 11, 0);
	var span = root();
	var text = $.only_child(span, true);

	$.template_effect(() => $.set_text(text, count()));
	$.append($$anchor, span);
	$.pop();
}