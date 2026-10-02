import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a target="_blank">link</a>`);

export default function Enforce_dynamic_links_test01_input($$anchor) {
	let link = '';
	var a = root();

	$.set_attribute(a, 'href', link);
	$.append($$anchor, a);
}