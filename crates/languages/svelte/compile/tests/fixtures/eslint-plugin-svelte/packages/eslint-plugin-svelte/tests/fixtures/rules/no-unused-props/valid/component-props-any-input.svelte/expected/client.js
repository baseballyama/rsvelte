import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Component_props_any_input($$anchor, $$props) {
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $$props.a));
	$.append($$anchor, p);
}