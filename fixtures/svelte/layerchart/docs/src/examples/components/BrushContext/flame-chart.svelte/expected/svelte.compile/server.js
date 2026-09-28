import * as $ from 'svelte/internal/server';
import { hierarchy } from 'd3-hierarchy';
import { curveStepAfter } from 'd3-shape';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';

import {
	Area,
	Axis,
	Chart,
	Group,
	Layer,
	Rect,
	RectClipPath,
	Text,
	Tooltip
} from 'layerchart';

import { Button } from 'svelte-ux';
import { format } from '@layerstack/utils';
import { getRequestTrace } from '$lib/data.remote';

let data = await getRequestTrace();

export default function Flame_chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const rowHeight = 24;
		const barHeight = rowHeight - 1; // leave a 1px gap between rows

		// A flame *chart* (vs. flame *graph*): the profile is a real trace, so each frame keeps its
		// actual `start`/`end` on a time axis and empty space = idle / I/O wait — unlike the aggregated,
		// space-filling flame graph.  `d3.hierarchy()` flattens the nested spans via `.descendants()`,
		// computing each frame's `depth` (and the tree `height`) for us.
		const root = hierarchy(data);

		const frames = root.descendants().map((node) => ({
			name: node.data.name,
			start: node.data.start,
			end: node.data.start + node.data.duration,
			depth: node.depth,
			duration: node.data.duration,
			self: node.data.duration - (node.children ?? []).reduce((sum, c) => sum + c.data.duration, 0)
		}));

		const total = data.start + data.duration; // root span covers the whole trace

		// Overview silhouette: active stack depth over time (dips during idle gaps) — drives the brush
		const sampleCount = 300;

		const overview = Array.from({ length: sampleCount }, (_, i) => {
			const time = (i + 0.5) * total / sampleCount;
			let depth = 0;

			for (const f of frames) {
				if (f.start <= time && time < f.end) depth = Math.max(depth, f.depth + 1);
			}

			return { time, depth };
		});

		let mainContext = void 0;

		// Color accessor: hash the frame name to a [0,1] value (the `Chart`'s `cScale` maps it to a
		// warm color — see the `c`/`cScale`/`cDomain` props below)
		function nameHash(name) {
			const maxChar = 6;
			const mod = 10;
			let hash = 0;
			let maxHash = 0;
			let weight = 1;

			for (let i = 0; i < Math.min(name.length, maxChar); i++) {
				hash += weight * (name.charCodeAt(i) % mod);
				maxHash += weight * (mod - 1);
				weight *= 0.7;
			}

			return maxHash > 0 ? hash / maxHash : 0;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center justify-between text-xs text-surface-content/50 mb-1 screenshot-hidden"><span>Drag to pan · scroll to zoom · brush the overview above · gaps = idle / I/O wait</span> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'fill-light',
				color: 'primary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Reset`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Chart($$renderer, {
				data: overview,
				x: 'time',
				xDomain: [0, total],
				y: 'depth',
				yDomain: [0, root.height + 1],
				padding: { left: 4, right: 4 },
				brush: {
					x: mainContext?.xDomain,
					onChange: (e) => {
						if (mainContext && e.brush.active) {
							mainContext.zoomToBrush(e.brush, 'x');
						}
					},

					onBrushEnd: (e) => {
						if (mainContext && !e.brush.active) {
							mainContext.transform.reset();
						}
					}
				},
				height: 48,
				class: 'mb-1',
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Area($$renderer, {
								curve: curveStepAfter,
								class: 'fill-primary/20',
								line: { class: 'stroke-primary stroke-1' }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function children($$renderer, { context }) {
					Layer($$renderer, {
						class: 'cursor-grab',
						children: ($$renderer) => {
							Axis($$renderer, {
								placement: 'bottom',
								rule: true,
								format: (v) => `${format(v, 'integer')} ms`
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like(frames);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let frame = each_array[$$index];
								const x0 = context.xScale(frame.start);
								const x1 = context.xScale(frame.end);
								const nodeWidth = x1 - x0;

								if (x1 > 0 && x0 < context.width && nodeWidth > 0.3) {
									$$renderer.push('<!--[0-->');

									const labelLeft = Math.max(0, -x0);
									const labelRight = Math.min(nodeWidth, context.width - x0);

									Group($$renderer, {
										x: x0,
										y: frame.depth * rowHeight,
										onpointermove: (e) => {
											if (!context.transform.dragging) context.tooltip.show(e, frame);
										},
										onpointerleave: () => context.tooltip.hide(),
										children: ($$renderer) => {
											Rect($$renderer, {
												width: nodeWidth,
												height: barHeight,
												rx: 2,
												fill: context.cGet(frame),
												class: 'stroke-surface-200'
											});

											$$renderer.push(`<!----> `);

											if (labelRight - labelLeft > 24) {
												$$renderer.push('<!--[0-->');

												RectClipPath($$renderer, {
													x: labelLeft,
													width: labelRight - labelLeft - 4,
													height: barHeight,
													children: ($$renderer) => {
														Text($$renderer, {
															value: frame.name,
															x: labelLeft + 5,
															y: barHeight / 2,
															verticalAnchor: 'middle',
															class: 'text-[10px] fill-black pointer-events-none'
														});
													},
													$$slots: { default: true }
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							$$renderer.push(`<!--]-->`);
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
										$$renderer.push(`<!---->${$.escape(data.name)}`);
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

											Tooltip.Item($$renderer, {
												label: 'Duration',
												value: `${$.stringify(format(data.duration, 'integer'))} ms`
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Self',
												value: `${$.stringify(format(data.self, 'integer'))} ms`
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Start',
												value: `${$.stringify(format(data.start, 'integer'))} ms`
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
					data: frames,
					x: ['start', 'end'],
					c: (d) => nameHash(d.name),
					cScale: scaleSequential(interpolateYlOrRd),
					cDomain: [-0.6, 1.6],
					transform: {
						mode: 'domain',
						axis: 'x',
						scaleExtent: [1, 64],
						domainExtent: { x: { min: 0, max: total, minRange: total / 60 } }
					},
					clip: true,
					padding: { left: 4, right: 4, bottom: 24 },
					height: (root.height + 1) * rowHeight + 24,
					get context() {
						return mainContext;
					},

					set context($$value) {
						mainContext = $$value;
						$$settled = false;
					},
					children,
					$$slots: { default: true }
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