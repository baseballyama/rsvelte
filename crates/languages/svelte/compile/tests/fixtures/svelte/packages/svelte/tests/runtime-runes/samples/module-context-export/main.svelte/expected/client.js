import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export const answer = 42;

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	var p = root();

	p.textContent = '42';
	$.append($$anchor, p);
}