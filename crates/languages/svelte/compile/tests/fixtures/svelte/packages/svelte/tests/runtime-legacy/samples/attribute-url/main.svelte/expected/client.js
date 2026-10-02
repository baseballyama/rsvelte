import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	let bgImage = 'https://example.com/foo.jpg';
	let color = 'red';
	var div = root();

	$.set_style(div, 'background-image: url(\'https://example.com/foo.jpg\'); color: red;');
	div.textContent = 'red';
	$.append($$anchor, div);
}