import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'collection', 'name']);
var root = $.from_html(`<div></div>`);

export default function IconifyIcon($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);

	// eslint-disable-next-line no-unused-expressions
	rest;

	var div = root();

	$.template_effect(() => $.set_class(div, 1, `i-${$$props.collection ?? ''}-${$$props.name ?? ''}`));
	$.append($$anchor, div);
}