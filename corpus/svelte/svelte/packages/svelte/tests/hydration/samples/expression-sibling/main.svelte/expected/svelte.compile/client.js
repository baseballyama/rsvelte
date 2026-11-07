import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> <span>3</span></p>`);

export default function Main($$anchor) {
	var p = root();
	var text = $.child(p);

	text.nodeValue = '1 2 ';
	$.next();
	$.reset(p);
	$.append($$anchor, p);
}