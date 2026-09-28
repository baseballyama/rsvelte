import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>nested component</p>`);

export default function Main($$anchor) {
	var p = root();

	$.append($$anchor, p);
}