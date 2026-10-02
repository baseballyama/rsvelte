import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Inner($$anchor, $$props) {
	console.log($$props.count);

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `component: ${$$props.count ?? ''}`));
	$.append($$anchor, p);
}