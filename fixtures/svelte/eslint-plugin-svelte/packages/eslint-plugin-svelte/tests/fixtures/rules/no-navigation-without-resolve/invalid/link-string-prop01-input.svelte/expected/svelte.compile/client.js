import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a>Click me!</a>`);

export default function Link_string_prop01_input($$anchor, $$props) {
	var a = root();

	$.template_effect(() => $.set_attribute(a, 'href', $$props.href));
	$.append($$anchor, a);
}