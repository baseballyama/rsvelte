import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	let url = "https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png";
	let alpha = 1;
	var div = root();

	$.set_style(div, '', {}, {
		'background-image': 'url(https://raw.githubusercontent.com/sveltejs/branding/master/svelte-vertical.png)',
		'--css-variable': 'rgba(0, 0, 0, 1)'
	});

	$.append($$anchor, div);
}