import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $$props.value));
	$.append($$anchor, p);
	$.pop();
}