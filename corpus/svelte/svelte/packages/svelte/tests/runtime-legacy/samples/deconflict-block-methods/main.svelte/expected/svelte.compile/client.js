import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	const create = 'deconflicted';
	var div = root();

	div.textContent = 'deconflicted';
	$.append($$anchor, div);
}