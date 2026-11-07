import * as $ from 'svelte/internal/server';
import { curveLinearClosed } from 'd3-shape';
import { Axis, Chart, Layer, Points, Spline } from 'layerchart';
import RadialControls from '$lib/components/controls/fields/RadialField.svelte';

export default function Radial_radar($$renderer, $$props) {
	const data = [
		{ name: 'fastball', value: 10 },
		{ name: 'change', value: 0 },
		{ name: 'slider', value: 4 },
		{ name: 'cutter', value: 8 },
		{ name: 'curve', value: 5 }
	];

	let curve = curveLinearClosed;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RadialControls($$renderer, {
			get curve() {
				return curve;
			},

			set curve($$value) {
				curve = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			data,
			x: 'name',
			y: 'value',
			yPadding: [0, 10],
			padding: { top: 32, bottom: 8 },
			radial: true,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'radius',
							grid: { class: 'stroke-surface-content/20 fill-surface-200/50' },
							ticks: [0, 5, 10],
							format: (d) => ''
						});

						$$renderer.push(`<!----> `);

						Axis($$renderer, {
							placement: 'angle',
							grid: { class: 'stroke-surface-content/20' }
						});

						$$renderer.push(`<!----> `);
						Spline($$renderer, { curve, class: 'stroke-primary fill-primary/20' });
						$$renderer.push(`<!----> `);
						Points($$renderer, { class: 'fill-primary stroke-surface-200' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
	$.bind_props($$props, { data });
}