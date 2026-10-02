import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Component($$anchor, $$props) {
	let text = $.prop($$props, 'text', 3, 'hello');
	var p = root();
	var text_1 = $.only_child(p, true);

	$.template_effect(() => $.set_text(text_1, text()));
	$.append($$anchor, p);
}