import * as $ from 'svelte/internal/server';
import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { cls } from '@layerstack/tailwind';
import { Chart, Layer, Arc, ArcLabel, LinearGradient, Tooltip } from 'layerchart';
import { Chord, Ribbon } from 'layerchart/graph';

export default function Gradient($$renderer, $$props) {
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
		let hoveredGroupIndex = null;
		let hoveredChord = null;

		function isChordActive(chord) {
			if (hoveredGroupIndex != null) {
				return chord.source.index === hoveredGroupIndex || chord.target.index === hoveredGroupIndex;
			}

			if (hoveredChord != null) {
				return chord.source.index === hoveredChord.source.index && chord.target.index === hoveredChord.target.index;
			}

			return true;
		}

		function isGroupActive(groupIndex) {
			if (hoveredGroupIndex != null) {
				return groupIndex === hoveredGroupIndex;
			}

			if (hoveredChord != null) {
				return groupIndex === hoveredChord.source.index || groupIndex === hoveredChord.target.index;
			}

			return true;
		}

		const hasHover = $.derived(() => hoveredGroupIndex != null || hoveredChord != null);

		function getGradientAngle(chord, groups) {
			const sourceGroup = groups[chord.source.index];
			const targetGroup = groups[chord.target.index];
			const sourceMid = (sourceGroup.startAngle + sourceGroup.endAngle) / 2;
			const targetMid = (targetGroup.startAngle + targetGroup.endAngle) / 2;
			const angle = (sourceMid + targetMid) / 2 * (180 / Math.PI) - 90;

			return angle;
		}

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						{
							function children($$renderer, { groups, chords, innerRadius, outerRadius }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(chords);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let chord = each_array[$$index];

									{
										function children($$renderer, { gradient }) {
											Ribbon($$renderer, {
												chord,
												radius: innerRadius,
												fill: gradient,
												fillOpacity: hasHover() ? isChordActive(chord) ? 0.8 : 0.1 : 0.67,
												stroke: 'none',
												class: 'transition-[fill-opacity] duration-200 cursor-pointer',
												onpointerenter: (e) => {
													hoveredChord = chord;

													context.tooltip.show(e, {
														source: names[chord.source.index],
														target: names[chord.target.index],
														value: chord.source.value
													});
												},

												onpointermove: (e) => {
													context.tooltip.show(e, {
														source: names[chord.source.index],
														target: names[chord.target.index],
														value: chord.source.value
													});
												},

												onpointerleave: () => {
													hoveredChord = null;
													context.tooltip.hide();
												}
											});
										}

										LinearGradient($$renderer, {
											stops: [
												color(names[chord.source.index]),
												color(names[chord.target.index])
											],
											rotate: getGradientAngle(chord, groups),
											children,
											$$slots: { default: true }
										});
									}
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
													class: cls('text-xs font-medium transition-opacity duration-200', hasHover() && !isGroupActive(group.index) && 'opacity-30')
												}
											]));
										}

										Arc($$renderer, {
											startAngle: group.startAngle,
											endAngle: group.endAngle,
											innerRadius,
											outerRadius,
											fill: color(names[group.index]),
											fillOpacity: hasHover() ? isGroupActive(group.index) ? 1 : 0.3 : 1,
											stroke: 'none',
											class: 'transition-[fill-opacity] duration-200 cursor-pointer',
											onpointerenter: () => hoveredGroupIndex = group.index,
											onpointerleave: () => hoveredGroupIndex = null,
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
								sortSubgroups: (a, b) => b - a,
								children,
								$$slots: { default: true }
							});
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.source)} → ${$.escape(data.target)}`);
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
										Tooltip.Item($$renderer, { label: 'Value', value: data.value, format: 'integer' });
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
				height: 500,
				padding: { top: 50, bottom: 30 },
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { matrix });
	});
}