import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg width="400" height="400"><rect></rect></svg>`);

export default function Main($$anchor) {
	const style = {
		fill: '#ff0000',
		x: '50',
		y: '50',
		width: '100',
		height: '75'
	};

	var svg = root();
	var rect = $.child(svg);

	$.attribute_effect(rect, () => ({ ...style }));
	$.reset(svg);
	$.append($$anchor, svg);
}