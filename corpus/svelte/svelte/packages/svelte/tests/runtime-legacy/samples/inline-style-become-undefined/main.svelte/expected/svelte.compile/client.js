import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor) {
	let bg = "red";

	const handle = () => {
		bg = undefined;
	};

	var div = root();
	let styles;

	$.template_effect(() => styles = $.set_style(div, '', styles, { background: bg }));
	$.event('click', div, handle);
	$.append($$anchor, div);
}