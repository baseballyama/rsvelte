import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<article><p>test1</p><p>test2</p></article>`);

export default function Input($$anchor) {
	var article = root();

	$.append($$anchor, article);
}