import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<canvas></canvas>`);

export default function Input($$anchor) {
	let foo;
	var canvas = root();

	$.bind_this(canvas, ($$value) => foo = $$value, () => foo);
	$.append($$anchor, canvas);
}