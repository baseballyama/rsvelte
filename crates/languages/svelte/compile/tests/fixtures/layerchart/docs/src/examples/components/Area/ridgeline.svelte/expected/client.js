import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Group, Layer, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';
import { curveBasis } from 'd3-shape';
import { max } from 'd3-array';
import { Field, RangeField, Switch } from 'svelte-ux';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-4 mb-4"><!> <!> <!></div> <!>`, 1);

export default function Ridgeline($$anchor, $$props) {
	$.push($$props, true);

	let overlap = $.state(2);
	let height = $.state(400);
	let opaque = $.state(false);
	const N = 10; // number of categories
	const basePadding = { top: 20, bottom: 30, left: 80, right: 10 };

	// Solve for top padding that fits the tallest peaks:
	// peaks extend (overlap-1)*step above the first row, and step depends on innerHeight
	const overlapExtra = $.derived(() => Math.max(0, $.get(overlap) - 1));

	const paddingTop = $.derived(() => (N * basePadding.top + $.get(overlapExtra) * ($.get(height) - basePadding.bottom)) / (N + $.get(overlapExtra)));
	const padding = $.derived(() => ({ ...basePadding, top: $.get(paddingTop) }));

	const categories = [
		'Series A',
		'Series B',
		'Series C',
		'Series D',
		'Series E',
		'Series F',
		'Series G',
		'Series H',
		'Series I',
		'Series J'
	];

	const seriesData = categories.map((name) => ({
		name,
		values: createDateSeries({ count: 40, min: 0, max: 100, value: 'integer' })
	}));

	const maxValue = max(seriesData.flatMap((s) => s.values.map((d) => d.value))) ?? 100;

	// Inner chart height (total minus padding) used to make yScale an identity
	const innerHeight = $.derived(() => $.get(height) - $.get(paddingTop) - basePadding.bottom);

	const step = $.derived(() => $.get(innerHeight) / N);

	// Value scale converts data values to pixel offsets within each row (negative = upward)
	const zScale = $.derived(() => scaleLinear().domain([0, maxValue]).range([0, -$.get(overlap) * $.get(step)]));

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
		min: 200,
		max: 600,
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
			x: 'date',
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

						$.each(node_5, 17, () => categories, $.index, ($$anchor, name, i) => {
							const rowY = $.derived(() => $.get(step) + i * $.get(step));

							Text($$anchor, {
								get value() {
									return $.get(name);
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