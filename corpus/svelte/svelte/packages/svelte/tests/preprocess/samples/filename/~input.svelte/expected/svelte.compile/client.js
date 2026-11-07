import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello __MARKUP_FILENAME__!</h1>`);

export default function Input($$anchor) {
	console.log('__SCRIPT_FILENAME__');

	var h1 = root();

	$.append($$anchor, h1);
}