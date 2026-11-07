import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	var p = root();

	p.textContent = frag;
	$.append($$anchor, p);
}