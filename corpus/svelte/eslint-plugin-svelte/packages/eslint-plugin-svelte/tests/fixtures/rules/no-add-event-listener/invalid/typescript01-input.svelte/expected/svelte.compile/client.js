import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello</div>`);

export default function Typescript01_input($$anchor) {
	const handler = (ev) => {
		console.log(ev);
	};

	window.addEventListener('message', handler);
	window.addEventListener('message', handler);

	var div = root();

	$.append($$anchor, div);
}