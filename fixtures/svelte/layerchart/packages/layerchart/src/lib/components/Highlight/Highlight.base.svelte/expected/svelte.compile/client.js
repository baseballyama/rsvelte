import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asAny } from '$lib/utils/types.js';
import { extractLayerProps } from '$lib/utils/attributes.js';
import { HighlightState } from './Highlight.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Circle',
	'Line',
	'Rect',
	'Arc',
	'points',
	'lines',
	'area',
	'bar',
	'opacity',
	'motion',
	'onAreaClick',
	'onBarClick',
	'onPointClick',
	'onPointEnter',
	'onPointLeave'
]);

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Highlight_base($$anchor, $$props) {
	$.push($$props, true);

	let points = $.prop($$props, 'points', 3, false),
		linesProp = $.prop($$props, 'lines', 3, false),
		area = $.prop($$props, 'area', 3, false),
		bar = $.prop($$props, 'bar', 3, false),
		motion = $.prop($$props, 'motion', 3, 'spring'),
		rest = $.rest_props($$props, rest_excludes);

	const c = new HighlightState(() => ({
		...rest,
		points: points(),
		lines: linesProp(),
		area: area(),
		bar: bar(),
		opacity: $$props.opacity,
		motion: motion()
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_9 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.snippet(node_3, area, () => ({ area: c.area }));
							$.append($$anchor, fragment_3);
						};

						var consequent_1 = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => motion() === 'spring' ? 'spring' : undefined);
								let $1 = $.derived(() => c.area.x + c.area.width);
								let $2 = $.derived(() => c.area.y + c.area.height);
								let $3 = $.derived(() => $$props.onAreaClick && ((e) => $$props.onAreaClick(e, { data: c.highlightData })));

								$.component(node_4, () => $$props.Arc, ($$anchor, Arc_1) => {
									Arc_1($$anchor, {
										get motion() {
											return $.get($0);
										},

										get startAngle() {
											return c.area.x;
										},

										get endAngle() {
											return $.get($1);
										},

										get innerRadius() {
											return c.area.y;
										},

										get outerRadius() {
											return $.get($2);
										},

										get opacity() {
											return $$props.opacity;
										},
										class: 'lc-highlight-area',
										get onclick() {
											return $.get($3);
										}
									});
								});
							}

							$.append($$anchor, fragment_4);
						};

						var alternate = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_5 = $.first_child(fragment_5);

							{
								let $0 = $.derived(() => motion() === 'spring' ? 'spring' : undefined);
								let $1 = $.derived(() => extractLayerProps(area(), 'lc-highlight-area'));
								let $2 = $.derived(() => $$props.onAreaClick && ((e) => $$props.onAreaClick(e, { data: c.highlightData })));

								$.component(node_5, () => $$props.Rect, ($$anchor, Rect_1) => {
									Rect_1($$anchor, $.spread_props(
										{
											get motion() {
												return $.get($0);
											},

											get opacity() {
												return $$props.opacity;
											}
										},
										() => c.area,
										() => $.get($1),
										{
											get onclick() {
												return $.get($2);
											}
										}
									));
								});
							}

							$.append($$anchor, fragment_5);
						};

						$.if(node_2, ($$render) => {
							if (typeof area() === 'function') $$render(consequent); else if (c.ctx.radial) $$render(consequent_1, 1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (area() && c.inPanel) $$render(consequent_2);
				});
			}

			var node_6 = $.sibling(node_1, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_6 = $.comment();
					var node_7 = $.first_child(fragment_6);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_7 = $.comment();
							var node_8 = $.first_child(fragment_7);

							$.snippet(node_8, bar);
							$.append($$anchor, fragment_7);
						};

						var alternate_1 = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_9 = $.first_child(fragment_8);

							$.await(node_9, () => import('../Bar/Bar.svelte'), null, ($$anchor, $$source) => {
								var $$value = $.derived(() => {
									var { default: Bar } = $.get($$source);

									return { Bar };
								});

								var Bar = $.derived(() => $.get($$value).Bar);
								var fragment_9 = $.comment();
								var node_10 = $.first_child(fragment_9);

								{
									let $0 = $.derived(() => motion() === 'spring' ? 'spring' : undefined);
									let $1 = $.derived(() => extractLayerProps(bar(), 'lc-highlight-bar'));
									let $2 = $.derived(() => $$props.onBarClick && ((e) => $$props.onBarClick(e, { data: c.highlightData })));

									$.component(node_10, () => $.get(Bar), ($$anchor, Bar_1) => {
										Bar_1($$anchor, $.spread_props(
											{
												get motion() {
													return $.get($0);
												},

												get data() {
													return c.highlightData;
												},

												get opacity() {
													return $$props.opacity;
												}
											},
											() => $.get($1),
											{
												get onclick() {
													return $.get($2);
												}
											}
										));
									});
								}

								$.append($$anchor, fragment_9);
							});

							$.append($$anchor, fragment_8);
						};

						$.if(node_7, ($$render) => {
							if (typeof bar() === 'function') $$render(consequent_3); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_6);
				};

				$.if(node_6, ($$render) => {
					if (bar() && c.inPanel) $$render(consequent_4);
				});
			}

			var node_11 = $.sibling(node_6, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_10 = $.comment();
					var node_12 = $.first_child(fragment_10);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_11 = $.comment();
							var node_13 = $.first_child(fragment_11);

							$.snippet(node_13, linesProp, () => ({ lines: c.lines }));
							$.append($$anchor, fragment_11);
						};

						var alternate_2 = ($$anchor) => {
							var fragment_12 = $.comment();
							var node_14 = $.first_child(fragment_12);

							$.each(node_14, 17, () => c.lines, $.index, ($$anchor, line) => {
								var fragment_13 = $.comment();
								var node_15 = $.first_child(fragment_13);

								{
									let $0 = $.derived(() => motion() === 'spring' ? 'spring' : undefined);
									let $1 = $.derived(() => extractLayerProps(linesProp(), 'lc-highlight-line'));

									$.component(node_15, () => $$props.Line, ($$anchor, Line_1) => {
										Line_1($$anchor, $.spread_props(
											{
												get motion() {
													return $.get($0);
												},

												get x1() {
													return $.get(line).x1;
												},

												get y1() {
													return $.get(line).y1;
												},

												get x2() {
													return $.get(line).x2;
												},

												get y2() {
													return $.get(line).y2;
												},
												dashArray: [2, 2],
												get opacity() {
													return $$props.opacity;
												}
											},
											() => $.get($1)
										));
									});
								}

								$.append($$anchor, fragment_13);
							});

							$.append($$anchor, fragment_12);
						};

						$.if(node_12, ($$render) => {
							if (typeof linesProp() === 'function') $$render(consequent_5); else $$render(alternate_2, -1);
						});
					}

					$.append($$anchor, fragment_10);
				};

				$.if(node_11, ($$render) => {
					if (linesProp()) $$render(consequent_6);
				});
			}

			var node_16 = $.sibling(node_11, 2);

			{
				var consequent_8 = ($$anchor) => {
					var fragment_14 = $.comment();
					var node_17 = $.first_child(fragment_14);

					{
						var consequent_7 = ($$anchor) => {
							var fragment_15 = $.comment();
							var node_18 = $.first_child(fragment_15);

							$.snippet(node_18, points, () => ({ points: c.points }));
							$.append($$anchor, fragment_15);
						};

						var alternate_3 = ($$anchor) => {
							var fragment_16 = $.comment();
							var node_19 = $.first_child(fragment_16);

							$.each(node_19, 17, () => c.points, $.index, ($$anchor, point) => {
								const pointOpacity = $.derived(() => $$props.opacity ?? ($.get(point).seriesKey
									? c.ctx.series.isHighlighted($.get(point).seriesKey, true) ? 1 : 0.1
									: undefined));

								var fragment_17 = $.comment();
								var node_20 = $.first_child(fragment_17);

								{
									let $0 = $.derived(() => motion() === 'spring' ? 'spring' : undefined);
									let $1 = $.derived(() => $.get(point).r ?? 4);
									let $2 = $.derived(() => $.get(point).r ? 2 : 6);
									let $3 = $.derived(() => extractLayerProps(points(), 'lc-highlight-point'));

									let $4 = $.derived(() => $$props.onPointClick && ((e) => {
										e.stopPropagation();
									}));

									let $5 = $.derived(() => $$props.onPointClick && ((e) => $$props.onPointClick(e, { point: $.get(point), data: c.highlightData })));

									$.component(node_20, () => $$props.Circle, ($$anchor, Circle_1) => {
										Circle_1($$anchor, $.spread_props(
											{
												get motion() {
													return $.get($0);
												},

												get cx() {
													return $.get(point).x;
												},

												get cy() {
													return $.get(point).y;
												},

												get fill() {
													return $.get(point).fill;
												},

												get r() {
													return $.get($1);
												},

												get strokeWidth() {
													return $.get($2);
												},

												get opacity() {
													return $.get(pointOpacity);
												}
											},
											() => $.get($3),
											{
												get onpointerdown() {
													return $.get($4);
												},

												get onclick() {
													return $.get($5);
												},

												onpointerenter: (e) => {
													if ($$props.onPointClick) {
														asAny(e.target).style.cursor = 'pointer';
													}

													if ($.get(point).seriesKey) {
														c.ctx.series.highlightKey = $.get(point).seriesKey;
													}

													$$props.onPointEnter?.(e, { point: $.get(point), data: c.highlightData });
												},

												onpointerleave: (e) => {
													if ($$props.onPointClick) {
														asAny(e.target).style.cursor = 'default';
													}

													if ($.get(point).seriesKey) {
														c.ctx.series.highlightKey = null;
													}

													$$props.onPointLeave?.(e, { point: $.get(point), data: c.highlightData });
												}
											}
										));
									});
								}

								$.append($$anchor, fragment_17);
							});

							$.append($$anchor, fragment_16);
						};

						$.if(node_17, ($$render) => {
							if (typeof points() === 'function') $$render(consequent_7); else $$render(alternate_3, -1);
						});
					}

					$.append($$anchor, fragment_14);
				};

				$.if(node_16, ($$render) => {
					if (points()) $$render(consequent_8);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (c.highlightData) $$render(consequent_9);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}