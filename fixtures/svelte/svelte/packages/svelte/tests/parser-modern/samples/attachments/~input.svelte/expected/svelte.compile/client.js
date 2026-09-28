import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	var div = root();

	$.attach(div, () => (node) => {});
	$.attach(div, () => (node) => {});
	$.append($$anchor, div);
}