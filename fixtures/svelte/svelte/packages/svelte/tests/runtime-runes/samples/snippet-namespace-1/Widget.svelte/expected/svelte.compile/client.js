import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg><!></svg>`);

export default function Widget($$anchor, $$props) {
	var svg = root();
	var node = $.child(svg);

	$.snippet(node, () => $$props.children);
	$.reset(svg);
	$.append($$anchor, svg);
}