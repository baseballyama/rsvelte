import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { zip } from 'd3-array';
import { Blockquote } from '@layerstack/docs/markdown/components';
import { getDimensionArrays } from '$lib/data.remote.js';

const data = await getDimensionArrays();

export default function Perf_dimension_arrays($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let example = 'single';
		let motion = true;
		let show = true;

		let chartProps = $.derived(() => ({
			xAxis: { format: (v) => format(new Date(v)) },
			tooltip: {
				root: { motion: motion ? 'spring' : 'none' },
				header: { format: (v) => format(new Date(v)) }
			},
			highlight: { motion: motion ? 'spring' : 'none' }
		}));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-4"><div class="flex gap-3">`);

			Field($$renderer, {
				label: 'Motion',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						get value() {
							return motion;
						},

						set value($$value) {
							motion = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Show',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						get value() {
							return show;
						},

						set value($$value) {
							show = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Yes`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->No`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			ToggleGroup($$renderer, {
				variant: 'underline',
				classes: { options: 'justify-start h-10' },
				get value() {
					return example;
				},

				set value($$value) {
					example = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					ToggleOption($$renderer, {
						value: 'single',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Single`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ToggleOption($$renderer, {
						value: 'series',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Series`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div><!---->`);

			{
				if (example === 'single') {
					$$renderer.push(`<!--[0--><div class="h-[500px] p-4 border rounded-sm">`);

					if (show) {
						$$renderer.push('<!--[0-->');

						LineChart($$renderer, {
							data: zip(data.date, data.cpu),
							x: (d) => d[0],
							y: (d) => d[1],
							props: chartProps(),
							brush: true,
							profile: true
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (example === 'series') {
					$$renderer.push(`<!--[1--><div class="h-[500px] p-4 border rounded-sm">`);

					if (show) {
						$$renderer.push('<!--[0-->');

						LineChart($$renderer, {
							x: (d) => d[0],
							y: (d) => d[1],
							series: [
								{
									key: 'cpu',
									data: zip(data.date, data.cpu),
									color: 'var(--color-danger)'
								},

								{
									key: 'ram',
									data: zip(data.date, data.ram),
									color: 'var(--color-warning)'
								},

								{
									key: 'tcp',
									data: zip(data.date, data.tcp),
									color: 'var(--color-success)'
								}
							],
							props: chartProps(),
							brush: true,
							profile: true
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!----></div> `);

			Blockquote($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Wide data (property per series). ${$.escape(format(data.cpu.length))} data points`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}