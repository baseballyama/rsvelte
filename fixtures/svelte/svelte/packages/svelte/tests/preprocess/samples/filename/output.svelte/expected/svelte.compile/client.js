import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello file.svelte!</h1>`);

export default function Output($$anchor) {
	console.log('file.svelte');

	var h1 = root();

	$.append($$anchor, h1);
}