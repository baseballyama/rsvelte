import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Arc,
	Chart,
	ClipPath,
	Group,
	Layer,
	Line,
	LinearGradient,
	Text
} from 'layerchart';

import { scaleLinear, scaleThreshold } from 'd3-scale';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-2"><input type="range" class="w-48"/> <!></div>`);

export default function Gauge($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(62);
	let outerRadius = 80;
	let innerRadius = 68;
	const domain = [0, 100];
	const angleRange = [-120, 120];
	const angleScale = scaleLinear().domain(domain).range(angleRange);
	const ticks = [0, 25, 50, 75, 100];

	const statusScale = scaleThreshold().domain([30, 70, 90]).range([
		{ label: 'Low', class: 'fill-red-500' },
		{ label: 'Good', class: 'fill-emerald-500' },
		{ label: 'Warning', class: 'fill-yellow-500' },
		{ label: 'Critical', class: 'fill-red-500' }
	]);

	const status = $.derived(() => statusScale($.get(value)));

	var $$exports = {
		get data() {
			return $.get(value);
		},

		set data($$value) {
			$.set(value, $.proxy($$value));
		}
	};

	var div = root_2();
	var input = $.child(div);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'max', 100);

	var node = $.sibling(input, 2);

	Chart(node, {
		height: 160,
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

							{
								const children = ($$anchor, $$arg0) => {
									let gradient = () => ($$arg0?.()).gradient;

									{
										const clip = ($$anchor) => {
											Arc($$anchor, {
												get value() {
													return $.get(value);
												},

												get domain() {
													return domain;
												},

												get range() {
													return angleRange;
												},
												outerRadius,
												innerRadius,
												cornerRadius: 6,
												motion: 'spring'
											});
										};

										ClipPath($$anchor, {
											clip,
											children: ($$anchor, $$slotProps) => {
												Arc($$anchor, {
													get value() {
														return domain[1];
													},

													get domain() {
														return domain;
													},

													get range() {
														return angleRange;
													},
													outerRadius,
													innerRadius,
													cornerRadius: 6,
													get fill() {
														return gradient();
													}
												});
											},
											$$slots: { clip: true, default: true }
										});
									}
								};

								LinearGradient(node_1, {
									class: 'from-emerald-500 via-yellow-500 to-red-500',
									children,
									$$slots: { default: true }
								});
							}

							var node_2 = $.sibling(node_1, 2);

							Arc(node_2, {
								get value() {
									return domain[1];
								},

								get domain() {
									return domain;
								},

								get range() {
									return angleRange;
								},
								outerRadius,
								innerRadius,
								cornerRadius: 6,
								class: 'fill-none',
								track: { class: 'fill-none stroke-surface-content/10' }
							});

							var node_3 = $.sibling(node_2, 2);

							$.each(node_3, 16, () => ticks, (tick) => tick, ($$anchor, tick) => {
								const angleDeg = $.derived(() => angleScale(tick));
								const angleRad = $.derived(() => $.get(angleDeg) * Math.PI / 180);
								const tickOuter = $.derived(() => innerRadius - 3);
								const tickInner = $.derived(() => innerRadius - 10);
								const labelRadius = $.derived(() => innerRadius - 16);
								var fragment_6 = root();
								var node_4 = $.first_child(fragment_6);

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
										class: 'stroke-surface-content/40',
										strokeWidth: 1.5
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
										class: 'text-[8px] fill-surface-content/50 tabular-nums'
									});
								}

								$.append($$anchor, fragment_6);
							});

							var node_6 = $.sibling(node_3, 2);

							{
								let $0 = $.derived(() => Math.round($.get(value)) + '%');

								Text(node_6, {
									get value() {
										return $.get($0);
									},
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									class: 'text-3xl font-bold tabular-nums'
								});
							}

							var node_7 = $.sibling(node_6, 2);

							{
								let $0 = $.derived(() => `text-[10px] font-medium ${$.get(status).class}`);

								Text(node_7, {
									x: 0,
									y: 22,
									get value() {
										return $.get(status).label;
									},
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									get class() {
										return $.get($0);
									}
								});
							}

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
	$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
	$.append($$anchor, div);

	return $.pop($$exports);
}