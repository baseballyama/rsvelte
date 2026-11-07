import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><text x="0" y="50"><tspan>foo</tspan> <tspan>foo</tspan> bar</text></svg>`);

export default function Main($$anchor) {
	var svg = root();
	var text = $.child(svg);
	var text_1 = $.sibling($.child(text));

	text_1.nodeValue = ' bar';
	$.next(2);
	$.reset(text);
	$.reset(svg);
	$.append($$anchor, svg);
}