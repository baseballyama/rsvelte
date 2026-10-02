import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import favicon from '$lib/assets/favicon.ico';
import './layout.css';

var root = $.from_html(`<link rel="icon"/>`);

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('vlp6n1', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', favicon));
		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment);
}