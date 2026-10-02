import * as $ from 'svelte/internal/server';
import { Chart, defaultChartPadding, Rect, Tooltip, thresholdTime } from 'layerchart';
import { bin } from 'd3-array';
import { randomNormal } from 'd3-random';
import { timeDay } from 'd3-time';
import { format } from '@layerstack/utils';
import HistogramControls from '$lib/components/controls/HistogramControls.svelte';

export default function Histogram_date_time_count($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let randomCount = 1000;
		let random = randomNormal();

		function getRandomDate(from, to) {
			const fromTime = from.getTime();
			const toTime = to.getTime();

			return new Date(fromTime + random() * (toTime - fromTime));
		}

		const now = new Date();
		let dateRange = 10;
		const randomData = $.derived(() => Array.from({ length: randomCount }, () => getRandomDate(timeDay.offset(now, -dateRange), now))); // TODO: Make typescript happy
		let thresholds = 10;
		let binByTime = $.derived(() => bin().thresholds(thresholdTime(thresholds ?? 0)));
		let data = $.derived(() => binByTime()(randomData()));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			HistogramControls($$renderer, {
				get dateRange() {
					return dateRange;
				},

				set dateRange($$value) {
					dateRange = $$value;
					$$settled = false;
				},

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
										$$renderer.push(`<!---->${$.escape(format(data.x0, 'day') + ' - ' + format(data.x1, 'day'))}`);
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
												Tooltip.Item($$renderer, { label: 'value', value: d, format: 'daytime' });
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
					x: ['x0', 'x1'],
					y: 'length',
					props: { yAxis: { format: 'metric' } },
					motion: { type: 'spring' },
					padding: defaultChartPadding({ left: 30, bottom: 30 }),
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
		$.bind_props($$props, { data });
	});
}