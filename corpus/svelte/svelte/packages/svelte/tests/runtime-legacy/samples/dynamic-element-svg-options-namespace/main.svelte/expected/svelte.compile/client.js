import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Rect from './rect.svelte';

var root = $.from_svg(`<svg><!></svg>`);

export default function Main($$anchor) {
	var svg = root();
	var node = $.child(svg);

	Rect(node, {});
	$.reset(svg);
	$.append($$anchor, svg);
}