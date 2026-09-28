import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Layer, defaultChartPadding } from 'layerchart';
import { Button, ButtonGroup } from 'svelte-ux';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Programmatic_control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let context = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ButtonGroup($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				class: 'mb-2',
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => {
							const mid = Math.floor(data.length / 3);

							context?.brush.move({ x: [data[0].date, data[mid].date] });
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->First Third`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => {
							const start = Math.floor(data.length / 3);
							const end = Math.floor(data.length / 3 * 2);

							context?.brush.move({ x: [data[start].date, data[end].date] });
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Middle Third`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => {
							const start = Math.floor(data.length / 3 * 2);

							context?.brush.move({ x: [data[start].date, data[data.length - 1].date] });
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Last Third`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ButtonGroup($$renderer, {
				variant: 'fill-light',
				size: 'sm',
				class: 'mb-2',
				children: ($$renderer) => {
					Button($$renderer, {
						onclick: () => context?.brush.selectAll(),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select All`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => context?.brush.reset(),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Reset`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Chart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				yDomain: [0, null],
				padding: defaultChartPadding({ left: 25, bottom: 24 }),
				brush: true,
				height: 300,
				get context() {
					return context;
				},

				set context($$value) {
					context = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'left', grid: true, rule: true });
							$$renderer.push(`<!----> `);
							Axis($$renderer, { placement: 'bottom', rule: true });
							$$renderer.push(`<!----> `);

							Area($$renderer, {
								line: { class: 'stroke-2 stroke-primary' },
								class: 'fill-primary/20'
							});

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
	});
}