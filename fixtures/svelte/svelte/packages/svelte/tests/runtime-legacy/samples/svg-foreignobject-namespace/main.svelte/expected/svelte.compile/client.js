import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><foreignObject x="0" y="0" width="100" height="100"><p>some text</p></foreignObject></svg>`);

export default function Main($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}