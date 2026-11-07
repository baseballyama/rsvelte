import * as $ from 'svelte/internal/server';
import { Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';

export default function Tweened($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = void 0;
		const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

		const keyColors = [
			'var(--color-info)',
			'var(--color-success)',
			'var(--color-warning)',
			'var(--color-danger)'
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ShowControl($$renderer, {
				label: 'Show Pie',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data,
				x: 'value',
				c: 'date',
				cRange: keyColors,
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						center: true,
						children: ($$renderer) => {
							if (show) {
								$$renderer.push('<!--[0-->');
								Pie($$renderer, { motion: 'tween' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
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
	});
}