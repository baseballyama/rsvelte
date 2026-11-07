import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { descending, range, sum, tickStep } from 'd3-array';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { format } from '@layerstack/utils';
import { Chart, Layer, Arc } from 'layerchart';
import { Chord, Ribbon } from 'layerchart/graph';

var root = $.from_svg(`<text dy="0.35em" class="text-[10px] font-bold fill-current"> </text>`);
var root_1 = $.from_svg(`<text dy="0.35em" class="text-[9px] fill-current"> </text>`);
var root_2 = $.from_svg(`<g><line x2="6" stroke="currentColor"></line><!></g>`);
var root_3 = $.from_svg(`<!><!>`, 1);

export default function Ticks($$anchor, $$props) {
	$.push($$props, true);

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

	var $$exports = { matrix };

	Chart($$anchor, {
		height: 800,
		padding: { top: 60, bottom: 60, left: 60, right: 60 },
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let groups = () => ($$arg0?.()).groups;
							let chords = () => ($$arg0?.()).chords;
							let innerRadius = () => ($$arg0?.()).innerRadius;
							let outerRadius = () => ($$arg0?.()).outerRadius;
							var fragment_3 = root_3();
							var node = $.first_child(fragment_3);

							$.each(node, 17, chords, (chord) => chord.source.index + '-' + chord.target.index, ($$anchor, chord) => {
								{
									let $0 = $.derived(() => color(names[$.get(chord).source.index]));

									Ribbon($$anchor, {
										get chord() {
											return $.get(chord);
										},

										get radius() {
											return innerRadius();
										},

										get fill() {
											return $.get($0);
										},
										fillOpacity: 0.67,
										stroke: 'none',
										style: 'mix-blend-mode: multiply'
									});
								}
							});

							var node_1 = $.sibling(node);

							$.each(node_1, 17, groups, (group) => group.index, ($$anchor, group) => {
								const ticks = $.derived(() => groupTicks($.get(group), step));
								var fragment_5 = root_3();
								var node_2 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => color(names[$.get(group).index]));

									Arc(node_2, {
										get startAngle() {
											return $.get(group).startAngle;
										},

										get endAngle() {
											return $.get(group).endAngle;
										},

										get innerRadius() {
											return innerRadius();
										},

										get outerRadius() {
											return outerRadius();
										},

										get fill() {
											return $.get($0);
										},
										class: 'stroke-surface-100'
									});
								}

								var node_3 = $.sibling(node_2);

								$.each(node_3, 17, () => $.get(ticks), $.index, ($$anchor, tick, i) => {
									const angle = $.derived(() => $.get(tick).angle);
									const isBottom = $.derived(() => $.get(angle) > Math.PI);
									var g = root_2();
									var node_4 = $.sibling($.child(g));

									{
										var consequent = ($$anchor) => {
											var text = root();
											var text_1 = $.only_child(text, true);

											$.template_effect(() => {
												$.set_attribute(text, 'x', $.get(isBottom) ? -8 : 8);
												$.set_attribute(text, 'text-anchor', $.get(isBottom) ? 'end' : 'start');
												$.set_attribute(text, 'transform', $.get(isBottom) ? 'rotate(180)' : null);
												$.set_text(text_1, names[$.get(group).index]);
											});

											$.append($$anchor, text);
										};

										var alternate = ($$anchor) => {
											var text_2 = root_1();
											var text_3 = $.only_child(text_2, true);

											$.template_effect(
												($0) => {
													$.set_attribute(text_2, 'x', $.get(isBottom) ? -8 : 8);
													$.set_attribute(text_2, 'text-anchor', $.get(isBottom) ? 'end' : 'start');
													$.set_attribute(text_2, 'transform', $.get(isBottom) ? 'rotate(180)' : null);
													$.set_text(text_3, $0);
												},
												[() => format($.get(tick).value, 'percentRound')]
											);

											$.append($$anchor, text_2);
										};

										$.if(node_4, ($$render) => {
											if (i === 0) $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.reset(g);
									$.template_effect(() => $.set_attribute(g, 'transform', `rotate(${$.get(angle) * 180 / Math.PI - 90}) translate(${outerRadius() ?? ''},0)`));
									$.append($$anchor, g);
								});

								$.append($$anchor, fragment_5);
							});

							$.append($$anchor, fragment_3);
						};

						Chord($$anchor, {
							get matrix() {
								return matrix;
							},
							padAngle: 0.05,
							get sortSubgroups() {
								return descending;
							},

							get sortChords() {
								return descending;
							},
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

	return $.pop($$exports);
}