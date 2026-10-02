import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> <span>!</span></h1>`);

export default function Main($$anchor) {
	const message = `call +636-555-3226 now`;
	var h1 = root();
	var text = $.child(h1, true);

	text.nodeValue = 'call +636-555-3226 now';
	$.next();
	$.reset(h1);
	$.append($$anchor, h1);
}