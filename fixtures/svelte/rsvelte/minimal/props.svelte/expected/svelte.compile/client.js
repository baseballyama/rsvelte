import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Props($$anchor, $$props) {
	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Hello ${$$props.name ?? ''}!`));
	$.append($$anchor, p);
}