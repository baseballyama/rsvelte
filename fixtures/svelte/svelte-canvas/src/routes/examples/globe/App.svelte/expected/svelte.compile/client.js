import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, Layer } from '$lib';
import { geoOrthographic, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land from 'world-atlas/land-110m.json';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const map = feature(land, 'land');
	let width = $.state(void 0);
	const pad = $.derived(() => $.get(width) * 0.02);

	const projection = $.derived(() => geoOrthographic().fitExtent(
		[
			[$.get(pad), $.get(pad)],
			[$.get(width) - $.get(pad), $.get(width) - $.get(pad)]
		],
		{ type: 'Sphere' }
	));

	const path = $.derived(() => geoPath($.get(projection)));

	Canvas($$anchor, {
		autoplay: true,
		onresize: (e) => $.set(width, e.width, true),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				render: ({ context, time }) => {
					$.get(path).context(context);
					$.get(projection).rotate([time / 50, -10]);
					context.strokeStyle = '#ccc';
					context.beginPath();
					$.get(path)(geoGraticule10());
					context.stroke();
				}
			});

			var node_1 = $.sibling(node, 2);

			Layer(node_1, {
				render: ({ context }) => {
					context.fillStyle = 'tomato';
					context.beginPath();
					$.get(path)(map);
					context.fill();
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}