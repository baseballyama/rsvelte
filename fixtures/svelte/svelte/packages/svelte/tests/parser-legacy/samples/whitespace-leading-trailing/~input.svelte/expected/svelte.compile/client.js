import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>just chillin' over here</p>`);

export default function Input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}