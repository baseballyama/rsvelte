import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	const content = `<b style='color: red;'>RED?!?</b>`;
	var p = root();

	p.textContent = '<b style=\'color: red;\'>RED?!?</b>';
	$.append($$anchor, p);
}