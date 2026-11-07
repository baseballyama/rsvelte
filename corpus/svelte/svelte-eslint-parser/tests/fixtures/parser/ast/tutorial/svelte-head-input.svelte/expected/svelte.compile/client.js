import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<link rel="stylesheet" href="tutorial/dark-theme.css"/>`);
var root_1 = $.from_html(`<h1>Hello world!</h1>`);

export default function Svelte_head_input($$anchor) {
	var h1 = root_1();

	$.head('1nvzoue', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	$.append($$anchor, h1);
}