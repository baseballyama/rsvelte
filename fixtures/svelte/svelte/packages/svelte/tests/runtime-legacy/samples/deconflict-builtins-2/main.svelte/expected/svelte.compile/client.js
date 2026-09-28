import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><text></text></svg>`);

export default function Main($$anchor) {
	let foo = 'hello world';
	var svg = root();
	var text = $.child(svg);

	text.textContent = 'hello world';
	$.reset(svg);
	$.append($$anchor, svg);
}