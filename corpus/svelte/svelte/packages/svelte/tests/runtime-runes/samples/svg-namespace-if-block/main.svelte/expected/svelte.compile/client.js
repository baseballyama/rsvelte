import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

var root = $.from_svg(`<svg viewBox="0 0 100 100" width="200px" height="200px"><!></svg>`);

export default function Main($$anchor) {
	var svg = root();
	var node = $.child(svg);

	Child(node, {});
	$.reset(svg);
	$.append($$anchor, svg);
}