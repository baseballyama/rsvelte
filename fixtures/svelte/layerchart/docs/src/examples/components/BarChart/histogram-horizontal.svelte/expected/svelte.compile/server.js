import * as $ from 'svelte/internal/server';
import { Chart, defaultChartPadding, Rect, Tooltip } from 'layerchart';
import { bin } from 'd3-array';
import HistogramControls from '$lib/components/controls/HistogramControls.svelte';
import { getOlympians } from '$lib/data.remote';

const olympians = await getOlympians();

export default function Histogram_horizontal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let thresholds = 10;
		const binByWeight = $.derived(() => bin().value((d) => d.weight).thresholds(thresholds));
		const data = $.derived(() => binByWeight()(olympians));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			HistogramControls($$renderer, {
				get thresholds() {
					return thresholds;
				},

				set thresholds($$value) {
					thresholds = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function marks($$renderer) {
					Rect($$renderer, {
						x0: (d) => 0,
						y0: 'x0',
						x1: 'length',
						y1: 'x1',
						insets: { y: 1 },
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
										$$renderer.push(`<!---->${$.escape(data.x0 + ' - ' + (data.x1 - 1))}`);
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
												Tooltip.Item($$renderer, { label: d.name, value: d.weight });
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
					data: data(),
					x: 'length',
					y: ['x0', 'x1'],
					valueAxis: 'x',
					height: 400,
					padding: defaultChartPadding({ right: 20 }),
					motion: { type: 'spring' },
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
		$.bind_props($$props, { data });
	});
}