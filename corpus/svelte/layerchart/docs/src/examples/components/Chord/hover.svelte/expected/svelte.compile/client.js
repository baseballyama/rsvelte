import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { cls } from '@layerstack/tailwind';
import { Chart, Layer, Arc, ArcLabel, Tooltip } from 'layerchart';
import { Chord, Ribbon } from 'layerchart/graph';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Hover($$anchor, $$props) {
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
	let hoveredGroupIndex = $.state(null);
	let hoveredChord = $.state(null);

	function isChordActive(chord) {
		if ($.get(hoveredGroupIndex) != null) {
			return chord.source.index === $.get(hoveredGroupIndex) || chord.target.index === $.get(hoveredGroupIndex);
		}

		if ($.get(hoveredChord) != null) {
			return chord.source.index === $.get(hoveredChord).source.index && chord.target.index === $.get(hoveredChord).target.index;
		}

		return true;
	}

	function isGroupActive(groupIndex) {
		if ($.get(hoveredGroupIndex) != null) {
			return groupIndex === $.get(hoveredGroupIndex);
		}

		if ($.get(hoveredChord) != null) {
			return groupIndex === $.get(hoveredChord).source.index || groupIndex === $.get(hoveredChord).target.index;
		}

		return true;
	}

	const hasHover = $.derived(() => $.get(hoveredGroupIndex) != null || $.get(hoveredChord) != null);
	var $$exports = { matrix };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Layer(node, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let groups = () => ($$arg0?.()).groups;
							let chords = () => ($$arg0?.()).chords;
							let innerRadius = () => ($$arg0?.()).innerRadius;
							let outerRadius = () => ($$arg0?.()).outerRadius;
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, chords, (chord) => chord.source.index + '-' + chord.target.index, ($$anchor, chord) => {
								{
									let $0 = $.derived(() => color(names[$.get(chord).source.index]));
									let $1 = $.derived(() => $.get(hasHover) ? isChordActive($.get(chord)) ? 0.8 : 0.1 : 0.67);

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

										get fillOpacity() {
											return $.get($1);
										},
										stroke: 'none',
										class: 'transition-[fill-opacity] duration-200 cursor-pointer',
										onpointerenter: (e) => {
											$.set(hoveredChord, $.get(chord), true);

											context().tooltip.show(e, {
												source: names[$.get(chord).source.index],
												target: names[$.get(chord).target.index],
												sourceValue: $.get(chord).source.value,
												targetValue: $.get(chord).target.value
											});
										},

										onpointermove: (e) => {
											context().tooltip.show(e, {
												source: names[$.get(chord).source.index],
												target: names[$.get(chord).target.index],
												sourceValue: $.get(chord).source.value,
												targetValue: $.get(chord).target.value
											});
										},

										onpointerleave: () => {
											$.set(hoveredChord, null);
											context().tooltip.hide();
										}
									});
								}
							});

							var node_2 = $.sibling(node_1, 2);

							$.each(node_2, 17, groups, (group) => group.index, ($$anchor, group) => {
								{
									const children = ($$anchor, arcProps = $.noop) => {
										{
											let $0 = $.derived(() => (outerRadius() - innerRadius()) / 2 + 6);
											let $1 = $.derived(() => cls('text-xs font-medium transition-opacity duration-200', $.get(hasHover) && !isGroupActive($.get(group).index) && 'opacity-30'));

											ArcLabel($$anchor, $.spread_props(arcProps, {
												placement: 'centroid-rotated',
												get offset() {
													return $.get($0);
												},

												get value() {
													return names[$.get(group).index];
												},

												get class() {
													return $.get($1);
												}
											}));
										}
									};

									let $0 = $.derived(() => color(names[$.get(group).index]));
									let $1 = $.derived(() => $.get(hasHover) ? isGroupActive($.get(group).index) ? 1 : 0.3 : 1);

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

										get fillOpacity() {
											return $.get($1);
										},
										stroke: 'none',
										class: 'transition-[fill-opacity] duration-200 cursor-pointer',
										onpointerenter: (e) => {
											$.set(hoveredGroupIndex, $.get(group).index, true);

											const row = matrix[$.get(group).index];
											const total = row.reduce((sum, v) => sum + v, 0);
											const breakdown = names.map((name, i) => ({ name, value: row[i] }));

											context().tooltip.show(e, {
												isGroup: true,
												name: names[$.get(group).index],
												total,
												breakdown
											});
										},

										onpointermove: (e) => {
											const row = matrix[$.get(group).index];
											const total = row.reduce((sum, v) => sum + v, 0);
											const breakdown = names.map((name, i) => ({ name, value: row[i] }));

											context().tooltip.show(e, {
												isGroup: true,
												name: names[$.get(group).index],
												total,
												breakdown
											});
										},

										onpointerleave: () => {
											$.set(hoveredGroupIndex, null);
											context().tooltip.hide();
										},
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
							sortSubgroups: (a, b) => b - a,
							children,
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_7 = $.comment();
					var node_4 = $.first_child(fragment_7);

					{
						var consequent = ($$anchor) => {
							var fragment_8 = root();
							var node_5 = $.first_child(fragment_8);

							$.component(node_5, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
								Tooltip_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, data().name));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Tooltip.List, ($$anchor, Tooltip_List) => {
								Tooltip_List($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();
										var node_7 = $.first_child(fragment_10);

										$.each(node_7, 17, () => data().breakdown, $.index, ($$anchor, item) => {
											var fragment_11 = $.comment();
											var node_8 = $.first_child(fragment_11);

											$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
												Tooltip_Item($$anchor, {
													get label() {
														return `${data().name ?? ''} → ${$.get(item).name ?? ''}`;
													},

													get value() {
														return $.get(item).value;
													},
													format: 'integer'
												});
											});

											$.append($$anchor, fragment_11);
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
											Tooltip_Separator($$anchor, {});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
											Tooltip_Item_1($$anchor, {
												label: 'Total',
												get value() {
													return data().total;
												},
												format: 'integer'
											});
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						};

						var alternate = ($$anchor) => {
							var fragment_12 = root();
							var node_11 = $.first_child(fragment_12);

							$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header_1) => {
								Tooltip_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, `${data().source ?? ''} ↔ ${data().target ?? ''}`));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List_1) => {
								Tooltip_List_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root();
										var node_13 = $.first_child(fragment_14);

										$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
											Tooltip_Item_2($$anchor, {
												get label() {
													return `${data().source ?? ''} → ${data().target ?? ''}`;
												},

												get value() {
													return data().sourceValue;
												},
												format: 'integer'
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, {
												get label() {
													return `${data().target ?? ''} → ${data().source ?? ''}`;
												},

												get value() {
													return data().targetValue;
												},
												format: 'integer'
											});
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						};

						$.if(node_4, ($$render) => {
							if (data().isGroup) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_7);
				};

				$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			height: 500,
			padding: { top: 50, bottom: 30 },
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}