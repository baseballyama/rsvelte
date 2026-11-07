import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Html_tags02_input($$anchor) {
	let string = `this string contains some <strong>HTML!!!</strong>`;
	var p = root();

	$.html(p, () => string, true);
	$.reset(p);
	$.append($$anchor, p);
}