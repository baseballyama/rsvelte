import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><rect></rect><rect></rect></svg>`);

export default function Main($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}