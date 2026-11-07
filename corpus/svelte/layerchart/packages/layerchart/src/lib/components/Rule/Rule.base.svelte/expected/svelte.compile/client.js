import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { pointRadial } from 'd3-shape';
import { cls } from '@layerstack/tailwind';
import { RuleState } from './Rule.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'Group',
	'Line',
	'Circle',
	'data',
	'x',
	'xOffset',
	'y',
	'yOffset',
	'stroke',
	'class',
	'children'
]);

export default function Rule_base($$anchor, $$props) {
	$.push($$props, true);

	let x = $.prop($$props, 'x', 3, false),
		xOffset = $.prop($$props, 'xOffset', 3, 0),
		y = $.prop($$props, 'y', 3, false),
		yOffset = $.prop($$props, 'yOffset', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	const c = new RuleState(() => ({
		data: $$props.data,
		x: x(),
		xOffset: xOffset(),
		y: y(),
		yOffset: yOffset(),
		stroke: $$props.stroke
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.Group, ($$anchor, Group_1) => {
		Group_1($$anchor, {
			class: 'lc-rule-g',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => c.lines, $.index, ($$anchor, line) => {
					const stroke = $.derived(() => $.get(line).stroke ?? $$props.stroke);
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									const computed_const = $.derived(() => {
										const [x1, y1] = pointRadial($.get(line).x1, $.get(line).y1);

										return { x1, y1 };
									});

									const computed_const_1 = $.derived(() => {
										const [x2, y2] = pointRadial($.get(line).x2, $.get(line).y2);

										return { x2, y2 };
									});

									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => cls('lc-rule-x-radial-line', $$props.class));

										$.component(node_4, () => $$props.Line, ($$anchor, Line_1) => {
											Line_1($$anchor, $.spread_props(() => restProps, {
												get x1() {
													return $.get(computed_const).x1;
												},

												get y1() {
													return $.get(computed_const).y1;
												},

												get x2() {
													return $.get(computed_const_1).x2;
												},

												get y2() {
													return $.get(computed_const_1).y2;
												},

												get stroke() {
													return $.get(stroke);
												},

												get class() {
													return $.get($0);
												}
											}));
										});
									}

									$.append($$anchor, fragment_4);
								};

								var consequent_1 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => cls('lc-rule-y-radial-circle', $$props.class));

										$.component(node_5, () => $$props.Circle, ($$anchor, Circle_1) => {
											Circle_1($$anchor, {
												get r() {
													return $.get(line).y1;
												},

												get stroke() {
													return $.get(stroke);
												},

												get class() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_5);
								};

								$.if(node_3, ($$render) => {
									if ($.get(line).axis === 'x') $$render(consequent); else if ($.get(line).axis === 'y') $$render(consequent_1, 1);
								});
							}

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_6 = $.first_child(fragment_6);

							{
								let $0 = $.derived(() => cls($.get(line).axis === 'x' ? 'lc-rule-x-line' : 'lc-rule-y-line', $$props.class));

								$.component(node_6, () => $$props.Line, ($$anchor, Line_2) => {
									Line_2($$anchor, $.spread_props(() => restProps, {
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

										get stroke() {
											return $.get(stroke);
										},

										get class() {
											return $.get($0);
										}
									}));
								});
							}

							$.append($$anchor, fragment_6);
						};

						$.if(node_2, ($$render) => {
							if (c.ctx.radial) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}