import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1pdfron">red</p>`);

export default function Main($$anchor) {
	var p = root();

	$.append($$anchor, p);
}