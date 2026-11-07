import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a></a>`);

export default function _3_input($$anchor) {
	var a = root();

	$.set_attribute(a, 'href', `page/${p ?? ''}`);
	a.textContent = `page ${p ?? ''}`;
	$.append($$anchor, a);
}