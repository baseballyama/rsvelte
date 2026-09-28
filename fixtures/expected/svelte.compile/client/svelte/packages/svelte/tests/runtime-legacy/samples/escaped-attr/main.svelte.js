import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<noscript></noscript>`);

export default function Main($$anchor) {
	var noscript = root();

	$.append($$anchor, noscript);
}