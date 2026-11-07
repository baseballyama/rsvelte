import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Canvas } from '$lib';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { Delaunay } from 'd3-delaunay';
import Point from './Point.svelte';
import Axis from './Axis.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const margin = { top: 24, right: 24, bottom: 36, left: 36 };
		let points = [];
		let width = void 0;
		let height = void 0;
		let picked = null;
		let click = false;

		onMount(() => fetch('https://raw.githubusercontent.com/vega/vega/master/docs/data/cars.json').then((data) => data.json()).then((data) => {
			points = data.map((d, id) => ({ mpg: d.Miles_per_Gallon, hp: d.Horsepower, id })).filter((d) => d.mpg && d.hp);
		}));

		let x = $.derived(() => scaleLinear().domain(extent(points, (d) => d.mpg)).range([margin.left, width - margin.right]).nice());
		let y = $.derived(() => scaleLinear().domain(extent(points, (d) => d.hp)).range([height - margin.bottom, margin.top]).nice());
		let delaunay = $.derived(() => Delaunay.from(points, (d) => x()(d.mpg), (d) => y()(d.hp)));

		Canvas($$renderer, {
			style: 'cursor: pointer',
			onresize: (e) => {
				width = e.width;
				height = e.height;
			},

			onmousemove: ({ offsetX, offsetY }) => {
				const i = delaunay().find(offsetX, offsetY);

				if (i) {
					picked = points[i].id;
					points.push(points.splice(i, 1)[0]);
					points = points;
				}
			},
			onmouseout: () => picked = null,
			onmousedown: () => click = true,
			onmouseup: () => click = false,
			children: ($$renderer) => {
				Axis($$renderer, { type: 'x', scale: x(), tickNumber: 8, margin });
				$$renderer.push(`<!----> `);
				Axis($$renderer, { type: 'y', scale: y(), tickNumber: 10, margin });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(points);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { mpg, hp, id } = each_array[$$index];

					Point($$renderer, {
						x: x()(mpg),
						y: y()(hp),
						fill: 'tomato',
						r: id === picked && !click ? 5 : 3,
						stroke: id === picked ? '#eee' : null
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}