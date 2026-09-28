import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="foo#missing">missing</a>`);

export default function _page($$anchor) {
	var a = root();

	$.append($$anchor, a);
}