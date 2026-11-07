import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Unuse01_input($$anchor) {
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';
	var input = root();

	$.append($$anchor, input);
}