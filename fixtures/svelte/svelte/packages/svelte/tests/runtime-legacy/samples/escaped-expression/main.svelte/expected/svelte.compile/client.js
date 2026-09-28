import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	var p = root();

	p.textContent = '<marquee>hello</marquee>';
	$.append($$anchor, p);
}