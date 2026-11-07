import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<main>At least I am documented</main>`);

export default function Input($$anchor) {
	var main = root();

	$.append($$anchor, main);
}