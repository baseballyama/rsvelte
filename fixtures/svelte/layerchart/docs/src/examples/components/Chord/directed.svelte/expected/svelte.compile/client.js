import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { Chart, Layer, Arc, ArcLabel } from 'layerchart';
import { Chord, Ribbon } from 'layerchart/graph';

var root = $.from_html(`<!> <!>`, 1);

export default function Directed($$anchor, $$props) {
	$.push($$props, true);

	const names = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];

	const matrix = [
		[11975, 5871, 8916, 2868, 1951],
		[1951, 10048, 2060, 6171, 990],
		[8010, 4948, 24000, 1048, 671],
		[1813, 1868, 708, 20000, 421],
		[1371, 901, 612, 371, 5000]
	];

	const color = scaleOrdinal(names, schemeTableau10);
	var $$exports = { matrix };

	Chart($$anchor, {
		height: 500,
		padding: { top: 50, bottom: 30 },
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
							var fragment_3 = root();
							var node = $.first_child(fragment_3);

							$.each(node, 17, chords, (chord) => chord.source.index + '-' + chord.target.index, ($$anchor, chord) => {
								{
									let $0 = $.derived(() => innerRadius() * 0.04);
									let $1 = $.derived(() => color(names[$.get(chord).target.index]));

									Ribbon($$anchor, {
										get chord() {
											return $.get(chord);
										},

										get radius() {
											return innerRadius();
										},
										directed: true,
										get headRadius() {
											return $.get($0);
										},

										get fill() {
											return $.get($1);
										},
										fillOpacity: 0.67,
										stroke: 'none'
									});
								}
							});

							var node_1 = $.sibling(node, 2);

							$.each(node_1, 17, groups, (group) => group.index, ($$anchor, group) => {
								{
									const children = ($$anchor, arcProps = $.noop) => {
										{
											let $0 = $.derived(() => (outerRadius() - innerRadius()) / 2 + 6);

											ArcLabel($$anchor, $.spread_props(arcProps, {
												placement: 'centroid-rotated',
												get offset() {
													return $.get($0);
												},

												get value() {
													return names[$.get(group).index];
												},
												class: 'text-xs font-medium'
											}));
										}
									};

									let $0 = $.derived(() => color(names[$.get(group).index]));

									Arc($$anchor, {
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
										stroke: 'none',
										children,
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_3);
						};

						Chord($$anchor, {
							get matrix() {
								return matrix;
							},
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

	return $.pop($$exports);
}