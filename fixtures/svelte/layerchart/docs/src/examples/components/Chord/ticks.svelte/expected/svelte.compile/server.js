import * as $ from 'svelte/internal/server';
import { descending, range, sum, tickStep } from 'd3-array';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { format } from '@layerstack/utils';
import { Chart, Layer, Arc } from 'layerchart';
import { Chord, Ribbon } from 'layerchart/graph';

export default function Ticks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const names = [
			'Apple',
			'HTC',
			'Huawei',
			'LG',
			'Nokia',
			'Samsung',
			'Sony',
			'Other'
		];

		const matrix = [
			[
				0.096899,
				0.008859,
				0.000554,
				0.00443,
				0.025471,
				0.024363,
				0.005537,
				0.025471
			],

			[
				0.001107,
				0.018272,
				0.0,
				0.004983,
				0.011074,
				0.01052,
				0.002215,
				0.004983
			],

			[
				0.000554,
				0.002769,
				0.002215,
				0.002215,
				0.003876,
				0.008306,
				0.000554,
				0.003322
			],

			[
				0.000554,
				0.001107,
				0.000554,
				0.012182,
				0.011628,
				0.006645,
				0.004983,
				0.01052
			],

			[
				0.002215,
				0.00443,
				0.0,
				0.002769,
				0.104097,
				0.012182,
				0.004983,
				0.028239
			],

			[
				0.011628,
				0.026024,
				0.013843,
				0.018272,
				0.014951,
				0.252177,
				0.038764,
				0.032668
			],

			[
				0.000554,
				0.004983,
				0.0,
				0.003322,
				0.00443,
				0.008859,
				0.017718,
				0.00443
			],

			[
				0.002215,
				0.007198,
				0.000554,
				0.003876,
				0.008859,
				0.013843,
				0.005537,
				0.066667
			]
		];

		const color = scaleOrdinal(names, schemeTableau10);
		const step = tickStep(0, sum(matrix.flat()), 100);

		function groupTicks(d, step) {
			const k = (d.endAngle - d.startAngle) / d.value;

			return range(0, d.value, step).map((value) => ({ value, angle: value * k + d.startAngle }));
		}

		Chart($$renderer, {
			height: 800,
			padding: { top: 60, bottom: 60, left: 60, right: 60 },
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
										fill: color(names[chord.source.index]),
										fillOpacity: 0.67,
										stroke: 'none',
										style: 'mix-blend-mode: multiply'
									});
								}

								$$renderer.push(`<!--]--><!--[-->`);

								const each_array_1 = $.ensure_array_like(groups);

								for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
									let group = each_array_1[$$index_2];
									const ticks = groupTicks(group, step);

									Arc($$renderer, {
										startAngle: group.startAngle,
										endAngle: group.endAngle,
										innerRadius,
										outerRadius,
										fill: color(names[group.index]),
										class: 'stroke-surface-100'
									});

									$$renderer.push(`<!----><!--[-->`);

									const each_array_2 = $.ensure_array_like(ticks);

									for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
										let tick = each_array_2[i];
										const angle = tick.angle;
										const isBottom = angle > Math.PI;

										$$renderer.push(`<g${$.attr('transform', `rotate(${$.stringify(angle * 180 / Math.PI - 90)}) translate(${$.stringify(outerRadius)},0)`)}><line x2="6" stroke="currentColor"></line>`);

										if (i === 0) {
											$$renderer.push(`<!--[0--><text${$.attr('x', isBottom ? -8 : 8)} dy="0.35em"${$.attr('text-anchor', isBottom ? 'end' : 'start')}${$.attr('transform', isBottom ? 'rotate(180)' : null)} class="text-[10px] font-bold fill-current">${$.escape(names[group.index])}</text>`);
										} else {
											$$renderer.push(`<!--[-1--><text${$.attr('x', isBottom ? -8 : 8)} dy="0.35em"${$.attr('text-anchor', isBottom ? 'end' : 'start')}${$.attr('transform', isBottom ? 'rotate(180)' : null)} class="text-[9px] fill-current">${$.escape(format(tick.value, 'percentRound'))}</text>`);
										}

										$$renderer.push(`<!--]--></g>`);
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]-->`);
							}

							Chord($$renderer, {
								matrix,
								padAngle: 0.05,
								sortSubgroups: descending,
								sortChords: descending,
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