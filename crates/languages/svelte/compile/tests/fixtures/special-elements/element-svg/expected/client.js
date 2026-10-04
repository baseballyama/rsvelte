import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 10 10"><!></svg>`);

export default function Element_svg($$anchor) {
	var svg = root();
	var node = $.child(svg);
	$.element(node, () => 'circle', true);
	$.reset(svg);
	$.append($$anchor, svg);
}
