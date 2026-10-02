import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Wrapper from "./Wrapper.svelte";

var root = $.from_svg(`<svg><!></svg>`);

export default function Main($$anchor) {
	var svg = root();
	var node = $.child(svg);

	Wrapper(node, {});
	$.reset(svg);
	$.append($$anchor, svg);
}