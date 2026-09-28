import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Sleep_report($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sleepChartData = [
			{ hour: "10pm", deep: 0, light: 30, rem: 0 },
			{ hour: "11pm", deep: 20, light: 10, rem: 0 },
			{ hour: "12am", deep: 40, light: 0, rem: 10 },
			{ hour: "1am", deep: 30, light: 5, rem: 15 },
			{ hour: "2am", deep: 10, light: 20, rem: 30 },
			{ hour: "3am", deep: 25, light: 10, rem: 20 },
			{ hour: "4am", deep: 15, light: 25, rem: 10 },
			{ hour: "5am", deep: 5, light: 35, rem: 15 },
			{ hour: "6am", deep: 0, light: 20, rem: 25 }
		];

		const sleepChartConfig = {
			deep: { label: "Deep", color: "var(--chart-1)" },
			light: { label: "Light", color: "var(--chart-2)" },
			rem: { label: "REM", color: "var(--chart-3)" }
		};

		const stats = [
			{ label: "Deep", value: "2h 10m" },
			{ label: "Light", value: "3h 48m" },
			{ label: "REM", value: "1h 26m" },
			{ label: "Score", value: "84" }
		];

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Sleep Report`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Last night · 7h 24m`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-3',
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: sleepChartConfig,
										class: 'h-32 w-full',
										children: ($$renderer) => {
											BarChart($$renderer, {
												data: sleepChartData,
												xScale: scaleBand().padding(0.4),
												x: 'hour',
												rule: false,
												series: [
													{
														key: "deep",
														label: "Deep",
														color: sleepChartConfig.deep.color,
														props: { rounded: "none" }
													},

													{
														key: "light",
														label: "Light",
														color: sleepChartConfig.light.color,
														props: { rounded: "none" }
													},

													{
														key: "rem",
														label: "REM",
														color: sleepChartConfig.rem.color,
														props: { rounded: "top" }
													}
												],
												seriesLayout: 'stack',
												props: { bars: { stroke: "none" } },
												axis: false,
												tooltipContext: false
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <div class="grid grid-cols-4 gap-2"><!--[-->`);

								const each_array = $.ensure_array_like(stats);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let { label, value } = each_array[$$index];

									$$renderer.push(`<div class="text-center"><div class="text-sm font-medium tabular-nums">${$.escape(value)}</div> <div class="text-xs text-muted-foreground">${$.escape(label)}</div></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								Badge($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Good`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'sm',
									class: 'ml-auto',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Details`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}