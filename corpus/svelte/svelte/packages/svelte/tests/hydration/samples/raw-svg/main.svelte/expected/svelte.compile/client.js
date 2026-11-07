import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg></svg>`);

export default function Main($$anchor) {
	var svg = root();

	$.html(svg, () => '<circle cx="200" cy="500" r="200"></circle>', true);
	$.reset(svg);
	$.append($$anchor, svg);
}