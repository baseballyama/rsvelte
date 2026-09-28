import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Group, Layer, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { curveBasis } from 'd3-shape';
import { max, mean, range } from 'd3-array';
import { Field, RangeField, Switch } from 'svelte-ux';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-4 mb-4"><!> <!> <!></div> <!>`, 1);

export default function Ridgeline_kde($$anchor, $$props) {
	$.push($$props, true);

	let overlap = $.state(4);
	let height = $.state(500);
	let opaque = $.state(true);

	const categories = [
		'Almost Certainly',
		'Highly Likely',
		'Very Good Chance',
		'Probable',
		'Likely',
		'Probably',
		'We Believe',
		'Better Than Even',
		'About Even',
		'We Doubt',
		'Improbable',
		'Unlikely',
		'Probably Not',
		'Little Chance',
		'Almost No Chance',
		'Highly Unlikely',
		'Chances Are Slight'
	];

	// Raw survey data: 46 respondents rated each phrase on a 0-100 probability scale
	const rawData = {
		'Almost Certainly': [
			95,
			95,
			95,
			95,
			98,
			97,
			95,
			97,
			95,
			90,
			99,
			95,
			99,
			90,
			95,
			80,
			99,
			95,
			95,
			99,
			95,
			97,
			90,
			99,
			99,
			95,
			93,
			95,
			99,
			99,
			90,
			95,
			99,
			90,
			95,
			95,
			95,
			99,
			95,
			97,
			95,
			95,
			99,
			95,
			95,
			95
		],
		'Highly Likely': [
			80,
			75,
			85,
			85,
			95,
			90,
			90,
			85,
			80,
			80,
			95,
			85,
			95,
			80,
			85,
			75,
			90,
			95,
			80,
			95,
			90,
			90,
			85,
			99,
			90,
			85,
			80,
			90,
			90,
			95,
			80,
			80,
			90,
			85,
			85,
			80,
			90,
			85,
			85,
			95,
			80,
			80,
			85,
			90,
			85,
			80
		],
		'Very Good Chance': [
			85,
			75,
			85,
			85,
			80,
			85,
			85,
			75,
			85,
			80,
			90,
			85,
			90,
			80,
			85,
			75,
			85,
			80,
			80,
			90,
			85,
			85,
			80,
			95,
			85,
			85,
			75,
			85,
			85,
			90,
			80,
			85,
			85,
			80,
			85,
			80,
			85,
			80,
			85,
			90,
			85,
			80,
			80,
			85,
			85,
			80
		],
		Probable: [
			75,
			51,
			70,
			70,
			70,
			70,
			75,
			60,
			75,
			65,
			80,
			70,
			85,
			65,
			70,
			60,
			75,
			70,
			70,
			80,
			75,
			70,
			70,
			90,
			75,
			70,
			60,
			75,
			75,
			80,
			70,
			70,
			70,
			65,
			70,
			70,
			75,
			70,
			70,
			80,
			75,
			65,
			70,
			70,
			70,
			65
		],
		Likely: [
			66,
			75,
			75,
			75,
			70,
			70,
			70,
			60,
			65,
			60,
			80,
			70,
			85,
			65,
			60,
			55,
			80,
			70,
			65,
			80,
			70,
			70,
			65,
			85,
			75,
			70,
			60,
			70,
			65,
			80,
			70,
			65,
			65,
			60,
			65,
			60,
			70,
			65,
			65,
			75,
			70,
			60,
			70,
			65,
			65,
			60
		],
		Probably: [
			75,
			51,
			70,
			70,
			75,
			70,
			70,
			55,
			65,
			60,
			70,
			65,
			80,
			60,
			60,
			50,
			70,
			60,
			60,
			75,
			65,
			65,
			60,
			80,
			70,
			65,
			55,
			65,
			60,
			70,
			60,
			60,
			60,
			55,
			60,
			60,
			65,
			60,
			60,
			70,
			65,
			55,
			60,
			60,
			60,
			55
		],
		'We Believe': [
			66,
			51,
			80,
			80,
			65,
			60,
			60,
			55,
			55,
			50,
			60,
			55,
			70,
			50,
			50,
			40,
			60,
			50,
			50,
			65,
			55,
			50,
			50,
			70,
			60,
			55,
			45,
			55,
			50,
			60,
			50,
			50,
			50,
			45,
			50,
			50,
			55,
			50,
			50,
			60,
			55,
			45,
			50,
			55,
			50,
			45
		],
		'Better Than Even': [
			55,
			51,
			60,
			60,
			60,
			55,
			55,
			50,
			55,
			50,
			60,
			55,
			65,
			50,
			55,
			45,
			60,
			55,
			55,
			60,
			55,
			55,
			50,
			65,
			55,
			55,
			50,
			55,
			55,
			60,
			55,
			55,
			55,
			50,
			55,
			50,
			55,
			50,
			55,
			60,
			55,
			50,
			55,
			55,
			55,
			50
		],
		'About Even': [
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50,
			50
		],
		'We Doubt': [
			40,
			20,
			30,
			30,
			10,
			20,
			30,
			25,
			20,
			20,
			20,
			25,
			20,
			20,
			30,
			30,
			20,
			15,
			20,
			15,
			20,
			20,
			20,
			15,
			20,
			20,
			25,
			20,
			20,
			15,
			20,
			25,
			20,
			20,
			20,
			20,
			20,
			20,
			20,
			20,
			20,
			25,
			20,
			20,
			20,
			20
		],
		Improbable: [
			20,
			49,
			10,
			10,
			50,
			15,
			15,
			20,
			15,
			15,
			10,
			15,
			10,
			15,
			10,
			20,
			10,
			10,
			15,
			5,
			10,
			15,
			15,
			5,
			10,
			15,
			20,
			10,
			10,
			5,
			10,
			15,
			10,
			15,
			10,
			15,
			10,
			10,
			15,
			10,
			10,
			20,
			15,
			10,
			10,
			15
		],
		Unlikely: [
			30,
			25,
			25,
			25,
			5,
			20,
			20,
			15,
			20,
			15,
			15,
			15,
			15,
			15,
			25,
			25,
			15,
			10,
			15,
			10,
			15,
			15,
			15,
			5,
			15,
			20,
			20,
			15,
			15,
			10,
			15,
			20,
			15,
			15,
			20,
			15,
			20,
			15,
			15,
			10,
			15,
			20,
			15,
			20,
			15,
			15
		],
		'Probably Not': [
			15,
			49,
			25,
			25,
			20,
			20,
			20,
			15,
			20,
			15,
			15,
			15,
			15,
			15,
			20,
			25,
			15,
			10,
			15,
			10,
			15,
			15,
			15,
			5,
			15,
			15,
			20,
			15,
			15,
			10,
			15,
			15,
			15,
			15,
			15,
			15,
			15,
			15,
			15,
			10,
			15,
			15,
			15,
			15,
			15,
			15
		],
		'Little Chance': [
			20,
			5,
			20,
			20,
			5,
			10,
			10,
			10,
			10,
			10,
			5,
			10,
			5,
			10,
			10,
			15,
			5,
			5,
			10,
			5,
			10,
			10,
			10,
			2,
			10,
			10,
			10,
			10,
			10,
			5,
			10,
			10,
			10,
			10,
			10,
			10,
			10,
			10,
			10,
			5,
			10,
			10,
			10,
			10,
			10,
			10
		],
		'Almost No Chance': [
			5,
			5,
			1,
			1,
			1,
			5,
			2,
			5,
			2,
			2,
			1,
			2,
			1,
			2,
			5,
			10,
			1,
			2,
			2,
			1,
			2,
			2,
			2,
			1,
			2,
			5,
			5,
			2,
			2,
			1,
			2,
			5,
			2,
			2,
			2,
			5,
			5,
			2,
			2,
			1,
			2,
			5,
			2,
			5,
			2,
			5
		],
		'Highly Unlikely': [
			25,
			10,
			5,
			5,
			2,
			5,
			5,
			5,
			5,
			5,
			2,
			5,
			2,
			5,
			5,
			10,
			2,
			3,
			5,
			1,
			5,
			5,
			5,
			1,
			5,
			5,
			5,
			5,
			5,
			2,
			5,
			5,
			5,
			5,
			5,
			5,
			5,
			5,
			5,
			2,
			5,
			5,
			5,
			5,
			5,
			5
		],
		'Chances Are Slight': [
			25,
			5,
			15,
			15,
			10,
			10,
			10,
			10,
			10,
			10,
			5,
			10,
			5,
			10,
			10,
			15,
			5,
			5,
			10,
			5,
			10,
			10,
			10,
			2,
			10,
			10,
			10,
			10,
			10,
			5,
			10,
			10,
			10,
			10,
			10,
			10,
			10,
			10,
			10,
			5,
			10,
			10,
			10,
			10,
			10,
			10
		]
	};

	// Epanechnikov kernel for KDE
	function epanechnikov(bandwidth) {
		return (v) => Math.abs(v /= bandwidth) <= 1 ? 0.75 * (1 - v * v) / bandwidth : 0;
	}

	// Kernel density estimator
	function kde(kernel, thresholds, data) {
		return thresholds.map((t) => ({ x: t, value: mean(data, (d) => kernel(t - d)) ?? 0 }));
	}

	const N = categories.length;
	const basePadding = { top: 20, bottom: 30, left: 140, right: 10 };
	const thresholds = range(0, 101, 2); // 0 to 100 in steps of 2
	const bandwidth = 7;

	// Compute KDE for each category
	const seriesData = categories.map((name) => ({
		name,
		values: kde(epanechnikov(bandwidth), thresholds, rawData[name])
	}));

	const maxDensity = max(seriesData.flatMap((s) => s.values.map((d) => d.value))) ?? 0.01;
	const overlapExtra = $.derived(() => Math.max(0, $.get(overlap) - 1));
	const paddingTop = $.derived(() => (N * basePadding.top + $.get(overlapExtra) * ($.get(height) - basePadding.bottom)) / (N + $.get(overlapExtra)));
	const padding = $.derived(() => ({ ...basePadding, top: $.get(paddingTop) }));
	const innerHeight = $.derived(() => $.get(height) - $.get(paddingTop) - basePadding.bottom);
	const step = $.derived(() => $.get(innerHeight) / N);
	const zScale = $.derived(() => scaleLinear().domain([0, maxDensity]).range([0, -$.get(overlap) * $.get(step)]));
	var $$exports = { data: seriesData };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Overlap',
		min: 1,
		max: 12,
		step: 0.5,
		get value() {
			return $.get(overlap);
		},

		set value($$value) {
			$.set(overlap, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Height',
		min: 300,
		max: 800,
		step: 50,
		get value() {
			return $.get(height);
		},

		set value($$value) {
			$.set(height, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Opaque',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return $.get(opaque);
					},

					set checked($$value) {
						$.set(opaque, $$value, true);
					}
				});
			}
		}
	});

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	{
		let $0 = $.derived(() => [0, $.get(innerHeight)]);

		Chart(node_3, {
			get data() {
				return seriesData[0].values;
			},
			x: 'x',
			y: 'value',
			get yDomain() {
				return $.get($0);
			},
			yRange: ({ height }) => [0, height],
			get padding() {
				return $.get(padding);
			},

			get height() {
				return $.get(height);
			},

			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						$.each(node_4, 19, () => seriesData, (series) => series.name, ($$anchor, series, i) => {
							const rowY = $.derived(() => $.get(step) + $.get(i) * $.get(step));

							Group($$anchor, {
								get y() {
									return $.get(rowY);
								},

								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(opaque)
											? 'fill-primary-200 dark:fill-primary-900'
											: 'fill-primary/20');

										Area($$anchor, {
											get data() {
												return $.get(series).values;
											},
											y0: () => 0,
											y1: (d) => $.get(zScale)(d.value),
											get curve() {
												return curveBasis;
											},

											get class() {
												return $.get($0);
											},
											line: { class: 'stroke-primary stroke-1' }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_4, 2);

						$.each(node_5, 18, () => categories, (name) => name, ($$anchor, name, i) => {
							const rowY = $.derived(() => $.get(step) + $.get(i) * $.get(step));

							Text($$anchor, {
								get value() {
									return name;
								},
								x: -8,
								get y() {
									return $.get(rowY);
								},
								textAnchor: 'end',
								verticalAnchor: 'middle',
								class: 'text-xs fill-surface-content/60'
							});
						});

						var node_6 = $.sibling(node_5, 2);

						Axis(node_6, { placement: 'bottom', rule: true });
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}