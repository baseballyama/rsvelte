import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { Chart, Layer, Arc, ArcLabel } from 'layerchart';
import { Chord, Ribbon } from 'layerchart/graph';

export default function Directed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const names = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];

		const matrix = [
			[11975, 5871, 8916, 2868, 1951],
			[1951, 10048, 2060, 6171, 990],
			[8010, 4948, 24000, 1048, 671],
			[1813, 1868, 708, 20000, 421],
			[1371, 901, 612, 371, 5000]
		];

		const color = scaleOrdinal(names, schemeTableau10);

		Chart($$renderer, {
			height: 500,
			padding: { top: 50, bottom: 30 },
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						{
							function children($$renderer, { groups, chords, innerRadius, outerRadius }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(chords);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let chord = each_array[$$index];

									Ribbon($$renderer, {
										chord,
										radius: innerRadius,
										directed: true,
										headRadius: innerRadius * 0.04,
										fill: color(names[chord.target.index]),
										fillOpacity: 0.67,
										stroke: 'none'
									});
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(groups);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let group = each_array_1[$$index_1];

									{
										function children($$renderer, arcProps) {
											ArcLabel($$renderer, $.spread_props([
												arcProps,
												{
													placement: 'centroid-rotated',
													offset: (outerRadius - innerRadius) / 2 + 6,
													value: names[group.index],
													class: 'text-xs font-medium'
												}
											]));
										}

										Arc($$renderer, {
											startAngle: group.startAngle,
											endAngle: group.endAngle,
											innerRadius,
											outerRadius,
											fill: color(names[group.index]),
											stroke: 'none',
											children,
											$$slots: { default: true }
										});
									}
								}

								$$renderer.push(`<!--]-->`);
							}

							Chord($$renderer, {
								matrix,
								padAngle: 0.05,
								variant: 'directed',
								sortSubgroups: (a, b) => b - a,
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { matrix });
	});
}