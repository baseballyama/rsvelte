import * as $ from 'svelte/internal/server';
import { Chart, defaultChartPadding, Rect, Tooltip } from 'layerchart';
import { bin } from 'd3-array';
import { randomNormal } from 'd3-random';
import HistogramControls from '$lib/components/controls/HistogramControls.svelte';

export default function Histogram_random_distribution($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedGenerator = 'normal';
		let randomCount = 1000;
		let random = randomNormal();
		const randomData = $.derived(() => Array.from({ length: randomCount }, () => random()));
		const binByValues = $.derived(bin //.domain([0, 1]);
		);
		const randomBins = $.derived(() => binByValues()(randomData()));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			HistogramControls($$renderer, {
				get random() {
					return random;
				},

				set random($$value) {
					random = $$value;
					$$settled = false;
				},

				get selectedGenerator() {
					return selectedGenerator;
				},

				set selectedGenerator($$value) {
					selectedGenerator = $$value;
					$$settled = false;
				},

				get randomCount() {
					return randomCount;
				},

				set randomCount($$value) {
					randomCount = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function marks($$renderer) {
					Rect($$renderer, {
						x0: 'x0',
						y0: (d) => 0,
						x1: 'x1',
						y1: 'length',
						insets: { x: 1 },
						class: 'fill-primary'
					});
				}

				function tooltip($$renderer) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									class: 'text-center',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(data.x0 + ' - ' + (data.x1 - 0.01))}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'count', value: data.length, format: 'integer' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Separator) {
											$$renderer.push('<!--[-->');
											Tooltip.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <!--[-->`);

										const each_array = $.ensure_array_like(data.slice(0, 5));

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let d = each_array[$$index];

											if (Tooltip.Item) {
												$$renderer.push('<!--[-->');
												Tooltip.Item($$renderer, { label: 'value', value: d });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]--> `);

										if (data.length > 5) {
											$$renderer.push(`<!--[0--><span></span> <span>...</span>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				Chart($$renderer, {
					data: randomBins(),
					x: ['x0', 'x1'],
					y: 'length',
					props: { yAxis: { format: 'metric' } },
					motion: { type: 'spring' },
					padding: defaultChartPadding({ left: 30 }),
					height: 300,
					tooltipContext: { mode: 'band' },
					highlight: { area: true },
					clip: true,
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data: randomBins });
	});
}