import * as $ from 'svelte/internal/server';
import { LineChart } from 'layerchart';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { Blockquote } from '@layerstack/docs/markdown/components';
import { getSeriesArrays } from '$lib/data.remote.js';

const data = await getSeriesArrays();

export default function Perf_series_arrays($$renderer, $$props) {
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
							data: data.cpu,
							x: 'x',
							y: 'y',
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
							x: 'x',
							y: 'y',
							series: [
								{ key: 'cpu', data: data.cpu, color: 'var(--color-danger)' },
								{ key: 'ram', data: data.ram, color: 'var(--color-warning)' },
								{ key: 'tcp', data: data.tcp, color: 'var(--color-success)' }
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
					$$renderer.push(`<!---->Array per series, each with \`x\` / \`y\` items. ${$.escape(format(data.cpu.length))} data points`);
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