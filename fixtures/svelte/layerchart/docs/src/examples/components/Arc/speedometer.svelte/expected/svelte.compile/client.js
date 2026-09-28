import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Circle, Group, Layer, Line, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-2"><input type="range" class="w-48"/> <!></div>`);

export default function Speedometer($$anchor, $$props) {
	$.push($$props, true);

	let speed = $.state(45);
	const domain = [0, 120];
	const angleRange = [-120, 120];
	let outerRadius = 80;
	let innerRadius = 70;
	const angleScale = scaleLinear().domain(domain).range(angleRange);

	const zones = [
		{ min: 0, max: 45, class: 'fill-emerald-500' },
		{ min: 45, max: 75, class: 'fill-yellow-500' },
		{ min: 75, max: 100, class: 'fill-orange-500' },
		{ min: 100, max: 120, class: 'fill-red-500' }
	];

	const majorTicks = Array.from({ length: 13 }, (_, i) => i * 10);
	const minorTicks = Array.from({ length: 25 }, (_, i) => i * 5).filter((t) => t % 10 !== 0);
	const needleAngleRad = $.derived(() => angleScale($.get(speed)) * Math.PI / 180);

	var $$exports = {
		get data() {
			return $.get(speed);
		},

		set data($$value) {
			$.set(speed, $.proxy($$value));
		}
	};

	var div = root_2();
	var input = $.child(div);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 120);

	var node = $.sibling(input, 2);

	Chart(node, {
		height: 200,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					Group($$anchor, {
						y: 20,
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_1 = $.first_child(fragment_2);

							$.each(node_1, 17, () => zones, (zone) => zone.min, ($$anchor, zone) => {
								{
									let $0 = $.derived(() => angleScale($.get(zone).min) * Math.PI / 180);
									let $1 = $.derived(() => angleScale($.get(zone).max) * Math.PI / 180);

									Arc($$anchor, {
										get startAngle() {
											return $.get($0);
										},

										get endAngle() {
											return $.get($1);
										},
										outerRadius,
										innerRadius,
										get class() {
											return $.get(zone).class;
										}
									});
								}
							});

							var node_2 = $.sibling(node_1, 2);

							Arc(node_2, {
								value: 0,
								get domain() {
									return domain;
								},

								get range() {
									return angleRange;
								},
								outerRadius,
								innerRadius,
								class: 'fill-none',
								track: { class: 'fill-none stroke-surface-content/5' }
							});

							var node_3 = $.sibling(node_2, 2);

							$.each(node_3, 16, () => majorTicks, (tick) => tick, ($$anchor, tick) => {
								const angleDeg = $.derived(() => angleScale(tick));
								const angleRad = $.derived(() => $.get(angleDeg) * Math.PI / 180);
								const tickInner = $.derived(() => innerRadius - 12);
								const tickOuter = $.derived(() => innerRadius - 2);
								const labelRadius = $.derived(() => innerRadius - 20);
								var fragment_4 = root();
								var node_4 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * $.get(tickInner));
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(tickInner));
									let $2 = $.derived(() => Math.sin($.get(angleRad)) * $.get(tickOuter));
									let $3 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(tickOuter));

									Line(node_4, {
										get x1() {
											return $.get($0);
										},

										get y1() {
											return $.get($1);
										},

										get x2() {
											return $.get($2);
										},

										get y2() {
											return $.get($3);
										},
										class: 'stroke-surface-content',
										strokeWidth: 2
									});
								}

								var node_5 = $.sibling(node_4, 2);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * $.get(labelRadius));
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(labelRadius));
									let $2 = $.derived(() => String(tick));

									Text(node_5, {
										get x() {
											return $.get($0);
										},

										get y() {
											return $.get($1);
										},

										get value() {
											return $.get($2);
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-[9px] fill-surface-content/60 tabular-nums'
									});
								}

								$.append($$anchor, fragment_4);
							});

							var node_6 = $.sibling(node_3, 2);

							$.each(node_6, 16, () => minorTicks, (tick) => tick, ($$anchor, tick) => {
								const angleDeg = $.derived(() => angleScale(tick));
								const angleRad = $.derived(() => $.get(angleDeg) * Math.PI / 180);
								const tickInner = $.derived(() => innerRadius - 8);
								const tickOuter = $.derived(() => innerRadius - 2);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * $.get(tickInner));
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(tickInner));
									let $2 = $.derived(() => Math.sin($.get(angleRad)) * $.get(tickOuter));
									let $3 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(tickOuter));

									Line($$anchor, {
										get x1() {
											return $.get($0);
										},

										get y1() {
											return $.get($1);
										},

										get x2() {
											return $.get($2);
										},

										get y2() {
											return $.get($3);
										},
										class: 'stroke-surface-content/40',
										strokeWidth: 1
									});
								}
							});

							var node_7 = $.sibling(node_6, 2);

							{
								let $0 = $.derived(() => Math.sin($.get(needleAngleRad)) * -10);
								let $1 = $.derived(() => -Math.cos($.get(needleAngleRad)) * -10);
								let $2 = $.derived(() => Math.sin($.get(needleAngleRad)) * (innerRadius - 10));
								let $3 = $.derived(() => -Math.cos($.get(needleAngleRad)) * (innerRadius - 10));

								Line(node_7, {
									get x1() {
										return $.get($0);
									},

									get y1() {
										return $.get($1);
									},

									get x2() {
										return $.get($2);
									},

									get y2() {
										return $.get($3);
									},
									class: 'stroke-red-500',
									strokeWidth: 2.5
								});
							}

							var node_8 = $.sibling(node_7, 2);

							Circle(node_8, { r: 5, class: 'fill-surface-content' });

							var node_9 = $.sibling(node_8, 2);

							{
								let $0 = $.derived(() => String(Math.round($.get(speed))));

								Text(node_9, {
									get value() {
										return $.get($0);
									},
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									dy: 28,
									class: 'text-2xl font-bold tabular-nums'
								});
							}

							var node_10 = $.sibling(node_9, 2);

							Text(node_10, {
								x: 0,
								y: 42,
								value: 'mph',
								textAnchor: 'middle',
								verticalAnchor: 'middle',
								class: 'text-[8px] fill-surface-content/50'
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_value(input, () => $.get(speed), ($$value) => $.set(speed, $$value));
	$.append($$anchor, div);

	return $.pop($$exports);
}