import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<link/>`);

export default function Main($$anchor, $$props) {
	var link = root();

	$.template_effect(() => $.set_attribute(link, 'href', $$props.browser ? '/foo' : '/bar'));
	$.append($$anchor, link);
}