import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Canvas } from '$lib';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { Delaunay } from 'd3-delaunay';
import Point from './Point.svelte';
import Axis from './Axis.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const margin = { top: 24, right: 24, bottom: 36, left: 36 };
	let points = $.state($.proxy([]));
	let width = $.state(void 0);
	let height = $.state(void 0);
	let picked = $.state(null);
	let click = $.state(false);

	onMount(() => fetch('https://raw.githubusercontent.com/vega/vega/master/docs/data/cars.json').then((data) => data.json()).then((data) => {
		$.set(points, data.map((d, id) => ({ mpg: d.Miles_per_Gallon, hp: d.Horsepower, id })).filter((d) => d.mpg && d.hp), true);
	}));

	let x = $.derived(() => scaleLinear().domain(extent($.get(points), (d) => d.mpg)).range([margin.left, $.get(width) - margin.right]).nice());
	let y = $.derived(() => scaleLinear().domain(extent($.get(points), (d) => d.hp)).range([$.get(height) - margin.bottom, margin.top]).nice());
	let delaunay = $.derived(() => Delaunay.from($.get(points), (d) => $.get(x)(d.mpg), (d) => $.get(y)(d.hp)));

	Canvas($$anchor, {
		style: 'cursor: pointer',
		onresize: (e) => {
			$.set(width, e.width, true);
			$.set(height, e.height, true);
		},

		onmousemove: ({ offsetX, offsetY }) => {
			const i = $.get(delaunay).find(offsetX, offsetY);

			if (i) {
				$.set(picked, $.get(points)[i].id, true);
				$.get(points).push($.get(points).splice(i, 1)[0]);
				$.set(points, $.get(points), true);
			}
		},
		onmouseout: () => $.set(picked, null),
		onmousedown: () => $.set(click, true),
		onmouseup: () => $.set(click, false),
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Axis(node, {
				type: 'x',
				get scale() {
					return $.get(x);
				},
				tickNumber: 8,
				get margin() {
					return margin;
				}
			});

			var node_1 = $.sibling(node, 2);

			Axis(node_1, {
				type: 'y',
				get scale() {
					return $.get(y);
				},
				tickNumber: 10,
				get margin() {
					return margin;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 17, () => $.get(points), ({ mpg, hp, id }) => id, ($$anchor, $$item) => {
				let mpg = () => $.get($$item).mpg;
				let hp = () => $.get($$item).hp;
				let id = () => $.get($$item).id;

				{
					let $0 = $.derived(() => $.get(x)(mpg()));
					let $1 = $.derived(() => $.get(y)(hp()));
					let $2 = $.derived(() => id() === $.get(picked) && !$.get(click) ? 5 : 3);
					let $3 = $.derived(() => id() === $.get(picked) ? '#eee' : null);

					Point($$anchor, {
						get x() {
							return $.get($0);
						},

						get y() {
							return $.get($1);
						},
						fill: 'tomato',
						get r() {
							return $.get($2);
						},

						get stroke() {
							return $.get($3);
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}