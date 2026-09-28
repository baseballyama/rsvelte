import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1>`);

export default function Child($$anchor, $$props) {
	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, $$props.value));
	$.append($$anchor, h1);
}