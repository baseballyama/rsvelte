import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Points from './points.svelte';

var root = $.from_svg(`<svg><!></svg>`);

export default function Main($$anchor) {
	var svg = root();
	var node = $.child(svg);

	Points(node, {});
	$.reset(svg);
	$.append($$anchor, svg);
}