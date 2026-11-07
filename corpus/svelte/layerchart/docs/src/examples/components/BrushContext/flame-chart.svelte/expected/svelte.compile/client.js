import 'svelte/internal/disclose-version';
import { getRequestTrace } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
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

let data = await getRequestTrace();
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex items-center justify-between text-xs text-surface-content/50 mb-1 screenshot-hidden"><span>Drag to pan · scroll to zoom · brush the overview above · gaps = idle / I/O wait</span> <!></div> <!> <!>`, 1);

export default function Flame_chart($$anchor, $$props) {
	$.push($$props, true);

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

	let mainContext = $.state(void 0);

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

	var $$exports = {
		get data() {
			return data;
		},

		set data($$value) {
			data = $$value;
		}
	};

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node_1 = $.sibling($.child(div), 2);

	Button(node_1, {
		size: 'sm',
		variant: 'fill-light',
		color: 'primary',
		$$events: { click: () => $.get(mainContext)?.transform.reset() },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Reset');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_2 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => [0, total]);
		let $1 = $.derived(() => [0, root.height + 1]);

		let $2 = $.derived(() => ({
			x: $.get(mainContext)?.xDomain,
			onChange: (e) => {
				if ($.get(mainContext) && e.brush.active) {
					$.get(mainContext).zoomToBrush(e.brush, 'x');
				}
			},

			onBrushEnd: (e) => {
				if ($.get(mainContext) && !e.brush.active) {
					$.get(mainContext).transform.reset();
				}
			}
		}));

		Chart(node_2, {
			get data() {
				return overview;
			},
			x: 'time',
			get xDomain() {
				return $.get($0);
			},
			y: 'depth',
			get yDomain() {
				return $.get($1);
			},
			padding: { left: 4, right: 4 },
			get brush() {
				return $.get($2);
			},
			height: 48,
			class: 'mb-1',
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						Area($$anchor, {
							get curve() {
								return curveStepAfter;
							},
							class: 'fill-primary/20',
							line: { class: 'stroke-primary stroke-1' }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = root_1();
			var node_4 = $.first_child(fragment_3);

			Layer(node_4, {
				class: 'cursor-grab',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_5 = $.first_child(fragment_4);

					Axis(node_5, {
						placement: 'bottom',
						rule: true,
						format: (v) => `${format(v, 'integer')} ms`
					});

					var node_6 = $.sibling(node_5, 2);

					$.each(node_6, 17, () => frames, (frame) => frame.name + '@' + frame.start, ($$anchor, frame) => {
						const x0 = $.derived(() => context().xScale($.get(frame).start));
						const x1 = $.derived(() => context().xScale($.get(frame).end));
						const nodeWidth = $.derived(() => $.get(x1) - $.get(x0));
						var fragment_5 = $.comment();
						var node_7 = $.first_child(fragment_5);

						{
							var consequent_1 = ($$anchor) => {
								const labelLeft = $.derived(() => Math.max(0, -$.get(x0)));
								const labelRight = $.derived(() => Math.min($.get(nodeWidth), context().width - $.get(x0)));

								{
									let $0 = $.derived(() => $.get(frame).depth * rowHeight);

									Group($$anchor, {
										get x() {
											return $.get(x0);
										},

										get y() {
											return $.get($0);
										},

										onpointermove: (e) => {
											if (!context().transform.dragging) context().tooltip.show(e, $.get(frame));
										},
										onpointerleave: () => context().tooltip.hide(),
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_1();
											var node_8 = $.first_child(fragment_7);

											{
												let $0 = $.derived(() => context().cGet($.get(frame)));

												Rect(node_8, {
													get width() {
														return $.get(nodeWidth);
													},
													height: barHeight,
													rx: 2,
													get fill() {
														return $.get($0);
													},
													class: 'stroke-surface-200'
												});
											}

											var node_9 = $.sibling(node_8, 2);

											{
												var consequent = ($$anchor) => {
													{
														let $0 = $.derived(() => $.get(labelRight) - $.get(labelLeft) - 4);

														RectClipPath($$anchor, {
															get x() {
																return $.get(labelLeft);
															},

															get width() {
																return $.get($0);
															},
															height: barHeight,
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => $.get(labelLeft) + 5);

																	Text($$anchor, {
																		get value() {
																			return $.get(frame).name;
																		},

																		get x() {
																			return $.get($0);
																		},
																		y: barHeight / 2,
																		verticalAnchor: 'middle',
																		class: 'text-[10px] fill-black pointer-events-none'
																	});
																}
															},
															$$slots: { default: true }
														});
													}
												};

												$.if(node_9, ($$render) => {
													if ($.get(labelRight) - $.get(labelLeft) > 24) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								}
							};

							$.if(node_7, ($$render) => {
								if ($.get(x1) > 0 && $.get(x0) < context().width && $.get(nodeWidth) > 0.3) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_5);
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_4, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_10 = root_1();
					var node_11 = $.first_child(fragment_10);

					$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, data().name));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root_2();
								var node_13 = $.first_child(fragment_12);

								{
									let $0 = $.derived(() => format(data().duration, 'integer'));

									$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'Duration',
											get value() {
												return `${$.get($0) ?? ''} ms`;
											}
										});
									});
								}

								var node_14 = $.sibling(node_13, 2);

								{
									let $0 = $.derived(() => format(data().self, 'integer'));

									$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, {
											label: 'Self',
											get value() {
												return `${$.get($0) ?? ''} ms`;
											}
										});
									});
								}

								var node_15 = $.sibling(node_14, 2);

								{
									let $0 = $.derived(() => format(data().start, 'integer'));

									$.component(node_15, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
										Tooltip_Item_2($$anchor, {
											label: 'Start',
											get value() {
												return `${$.get($0) ?? ''} ms`;
											}
										});
									});
								}

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_10);
				};

				$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_3);
		};

		let $0 = $.derived(() => scaleSequential(interpolateYlOrRd));

		let $1 = $.derived(() => ({
			mode: 'domain',
			axis: 'x',
			scaleExtent: [1, 64],
			domainExtent: { x: { min: 0, max: total, minRange: total / 60 } }
		}));

		let $2 = $.derived(() => (root.height + 1) * rowHeight + 24);

		Chart(node_3, {
			get data() {
				return frames;
			},
			x: ['start', 'end'],
			c: (d) => nameHash(d.name),
			get cScale() {
				return $.get($0);
			},
			cDomain: [-0.6, 1.6],
			get transform() {
				return $.get($1);
			},
			clip: true,
			padding: { left: 4, right: 4, bottom: 24 },
			get height() {
				return $.get($2);
			},

			get context() {
				return $.get(mainContext);
			},

			set context($$value) {
				$.set(mainContext, $$value, true);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}