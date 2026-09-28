import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p>nested</p></div>`);

export default function Main($$anchor) {
	var div = root();

	$.append($$anchor, div);
}