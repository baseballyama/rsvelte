import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<x><z></z></x>`);

export default function Input($$anchor) {
	var x = root();

	$.append($$anchor, x);
}