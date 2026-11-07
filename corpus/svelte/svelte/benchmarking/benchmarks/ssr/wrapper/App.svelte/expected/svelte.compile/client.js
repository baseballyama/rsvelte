import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="tile"></div>`);
var root_1 = $.from_html(`<div id="wrapper"></div>`);

export default function App($$anchor) {
	const wrapperWidth = 960;
	const wrapperHeight = 720;
	const cellSize = 10;
	const centerX = wrapperWidth / 2;
	const centerY = wrapperHeight / 2;
	let angle = 0;
	let radius = 0;
	let tiles = [];
	const step = cellSize;

	while (radius < Math.min(wrapperWidth, wrapperHeight) / 2) {
		let x = centerX + Math.cos(angle) * radius;
		let y = centerY + Math.sin(angle) * radius;

		if (x >= 0 && x <= wrapperWidth - cellSize && y >= 0 && y <= wrapperHeight - cellSize) {
			tiles.push({ x, y });
		}

		angle += 0.2;
		radius += step * 0.015;
	}

	var div = root_1();

	$.each(div, 21, () => tiles, $.index, ($$anchor, $$item) => {
		let x = () => $.get($$item).x;
		let y = () => $.get($$item).y;
		var div_1 = root();

		$.template_effect(($0, $1) => $.set_style(div_1, `left: ${$0 ?? ''}px; top: ${$1 ?? ''}px;`), [() => x().toFixed(2), () => y().toFixed(2)]);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}