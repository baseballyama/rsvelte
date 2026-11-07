import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>This is a async svelte live code</h1>`);

export default function LiveCodebaa49804eec($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}