import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Circle, Group, Layer, Line, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import * as chromatic from 'd3-scale-chromatic';
import { RangeField, SelectField, Switch } from 'svelte-ux';

var root = $.from_html(`<div slot="append" role="none"><div class="text-[10px] text-surface-content/50 text-center">Invert</div> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-[1fr_1fr_1fr] gap-2 mb-2"><!> <!> <!> <!> <!> <!> <!></div> <!>`, 1);

export default function Gauge_gradient($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(68);
	let segments = $.state(150);
	let tickCount = $.state(5);
	let outerRadius = $.state(80);
	let innerRadius = $.state(68);
	let arcSpan = $.state(240);
	let colorScheme = $.state('interpolateRdYlBu');
	let invertColors = $.state(true);

	const colorSchemes = [
		'interpolateRdYlBu',
		'interpolateRdYlGn',
		'interpolateSpectral',
		'interpolateRdBu',
		'interpolatePiYG',
		'interpolatePRGn',
		'interpolateBrBG',
		'interpolateRdGy',
		'interpolatePuOr',
		'interpolateViridis',
		'interpolatePlasma',
		'interpolateInferno',
		'interpolateMagma',
		'interpolateTurbo',
		'interpolateCool',
		'interpolateWarm',
		'interpolateRainbow',
		'interpolateSinebow',
		'interpolateCividis'
	];

	const domain = [0, 100];
	const halfSpan = $.derived(() => $.get(arcSpan) / 2);
	const angleRange = $.derived(() => [-$.get(halfSpan), $.get(halfSpan)]);
	const angleScale = $.derived(() => scaleLinear().domain(domain).range($.get(angleRange)));
	const interpolate = $.derived(() => chromatic[$.get(colorScheme)]);

	const segmentData = $.derived(() => Array.from({ length: $.get(segments) }, (_, i) => {
		const t = i / $.get(segments);

		return {
			startAngle: $.get(angleScale)(t * 100) * Math.PI / 180,
			endAngle: $.get(angleScale)((i + 1) / $.get(segments) * 100) * Math.PI / 180,
			color: $.get(interpolate)($.get(invertColors) ? 1 - t : t)
		};
	}));

	const ticks = $.derived(() => Array.from({ length: $.get(tickCount) + 1 }, (_, i) => i / $.get(tickCount) * 100));
	const needleAngleRad = $.derived(() => $.get(angleScale)($.get(value)) * Math.PI / 180);

	var $$exports = {
		get data() {
			return $.get(value);
		},

		set data($$value) {
			$.set(value, $.proxy($$value));
		}
	};

	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Value',
		min: 0,
		max: 100,
		step: 1,
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Arc Span',
		min: 10,
		max: 360,
		step: 5,
		get value() {
			return $.get(arcSpan);
		},

		set value($$value) {
			$.set(arcSpan, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Ticks',
		min: 1,
		max: 20,
		get value() {
			return $.get(tickCount);
		},

		set value($$value) {
			$.set(tickCount, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $.get(outerRadius) - 2);

		RangeField(node_3, {
			label: 'Inner Radius',
			min: 10,
			get max() {
				return $.get($0);
			},

			get value() {
				return $.get(innerRadius);
			},

			set value($$value) {
				$.set(innerRadius, $$value, true);
			}
		});
	}

	var node_4 = $.sibling(node_3, 2);

	RangeField(node_4, {
		label: 'Outer Radius',
		min: 20,
		max: 120,
		get value() {
			return $.get(outerRadius);
		},

		set value($$value) {
			$.set(outerRadius, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	RangeField(node_5, {
		label: 'Color Steps',
		get min() {
			return $.get(tickCount);
		},
		max: 200,
		get value() {
			return $.get(segments);
		},

		set value($$value) {
			$.set(segments, $$value, true);
		}
	});

	var node_6 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => colorSchemes.map((s) => ({ label: s.replace('interpolate', ''), value: s })));

		SelectField(node_6, {
			label: 'Color Scheme',
			get options() {
				return $.get($0);
			},
			stepper: true,
			clearable: false,
			toggleIcon: null,
			class: 'col-span-full',
			get value() {
				return $.get(colorScheme);
			},

			set value($$value) {
				$.set(colorScheme, $$value, true);
			},

			$$slots: {
				append: ($$anchor, $$slotProps) => {
					var div_1 = root();
					var node_7 = $.sibling($.child(div_1), 2);

					Switch(node_7, {
						size: 'md',
						get checked() {
							return $.get(invertColors);
						},

						set checked($$value) {
							$.set(invertColors, $$value, true);
						}
					});

					$.reset(div_1);
					$.delegated('click', div_1, (e) => e.stopPropagation());
					$.append($$anchor, div_1);
				}
			}
		});
	}

	$.reset(div);

	var node_8 = $.sibling(div, 2);

	Chart(node_8, {
		height: 200,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					Group($$anchor, {
						y: 16,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_9 = $.first_child(fragment_3);

							$.each(node_9, 17, () => $.get(segmentData), $.index, ($$anchor, seg) => {
								Arc($$anchor, {
									get startAngle() {
										return $.get(seg).startAngle;
									},

									get endAngle() {
										return $.get(seg).endAngle;
									},

									get outerRadius() {
										return $.get(outerRadius);
									},

									get innerRadius() {
										return $.get(innerRadius);
									},

									get fill() {
										return $.get(seg).color;
									}
								});
							});

							var node_10 = $.sibling(node_9, 2);

							$.each(node_10, 16, () => $.get(ticks), (tick) => tick, ($$anchor, tick) => {
								const angleRad = $.derived(() => $.get(angleScale)(tick) * Math.PI / 180);
								const tickInner = $.derived(() => $.get(innerRadius) - 0);
								const tickOuter = $.derived(() => $.get(outerRadius) + 0);
								const labelRadius = $.derived(() => $.get(innerRadius) - 14);
								var fragment_5 = root_1();
								var node_11 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * $.get(tickInner));
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(tickInner));
									let $2 = $.derived(() => Math.sin($.get(angleRad)) * $.get(tickOuter));
									let $3 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(tickOuter));

									Line(node_11, {
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
										class: 'stroke-surface-200',
										strokeWidth: 1.5
									});
								}

								var node_12 = $.sibling(node_11, 2);

								{
									let $0 = $.derived(() => Math.sin($.get(angleRad)) * $.get(labelRadius));
									let $1 = $.derived(() => -Math.cos($.get(angleRad)) * $.get(labelRadius));
									let $2 = $.derived(() => tick / 100);

									Text(node_12, {
										get x() {
											return $.get($0);
										},

										get y() {
											return $.get($1);
										},

										get value() {
											return $.get($2);
										},
										format: 'percentRound',
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-[8px] fill-surface-content/50 tabular-nums'
									});
								}

								$.append($$anchor, fragment_5);
							});

							var node_13 = $.sibling(node_10, 2);

							{
								let $0 = $.derived(() => Math.sin($.get(needleAngleRad)) * -10);
								let $1 = $.derived(() => -Math.cos($.get(needleAngleRad)) * -10);
								let $2 = $.derived(() => Math.sin($.get(needleAngleRad)) * ($.get(outerRadius) + 2));
								let $3 = $.derived(() => -Math.cos($.get(needleAngleRad)) * ($.get(outerRadius) + 2));

								Line(node_13, {
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

							var node_14 = $.sibling(node_13, 2);

							Circle(node_14, { r: 6, class: 'fill-surface-content' });

							var node_15 = $.sibling(node_14, 2);

							Circle(node_15, { r: 3, class: 'fill-surface-200' });

							var node_16 = $.sibling(node_15, 2);

							{
								let $0 = $.derived(() => $.get(value) + '%');

								Text(node_16, {
									get value() {
										return $.get($0);
									},
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									dy: 30,
									class: 'text-2xl font-bold tabular-nums'
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);