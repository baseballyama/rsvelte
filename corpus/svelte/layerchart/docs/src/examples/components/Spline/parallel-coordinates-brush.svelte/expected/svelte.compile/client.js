import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';

import {
	Axis,
	Brush,
	BrushState,
	Chart,
	Group,
	Spline,
	Text,
	pivotLonger
} from 'layerchart';

import { extent } from 'd3-array';
import { scaleLinear, scalePoint } from 'd3-scale';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-sm text-surface-content/70 mb-2"> <!></div> <!>`, 1);

export default function Parallel_coordinates_brush($$anchor, $$props) {
	$.push($$props, true);

	const dimensions = {
		bill_length_mm: 'Bill length',
		bill_depth_mm: 'Bill depth',
		flipper_length_mm: 'Flipper length',
		body_mass_g: 'Body mass'
	};

	const keys = Object.keys(dimensions);
	const rows = penguins.filter((d) => keys.every((k) => d[k] !== 'NA')).map((d, id) => ({ ...d, id }));

	// One scale per dimension, normalizing to `0–1` so every dimension shares the chart's `y`
	const scales = new Map(keys.map((k) => [k, scaleLinear().domain(extent(rows, (d) => d[k]))]));

	const data = pivotLonger(rows, keys, 'dimension', 'value');

	// One selection per dimension, each owned by its `<Brush>` below and read back here
	let brushes = $.proxy({});

	const active = $.derived(() => keys.filter((k) => brushes[k]?.active));

	// A penguin is kept when it falls inside *every* brushed dimension
	const selectedIds = $.derived(() => new Set(rows.filter((row) => $.get(active).every((k) => brushes[k].contains({ y: scales.get(k)(row[k]) }))).map((d) => d.id)));

	const BRUSH_WIDTH = 24;
	var $$exports = { data };
	var fragment = root_1();
	var div = $.first_child(fragment);
	var text = $.child(div);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, `· brushed on ${$0 ?? ''}`), [() => $.get(active).map((k) => dimensions[k]).join(', ')]);
			$.append($$anchor, text_1);
		};

		$.if(node, ($$render) => {
			if ($.get(active).length) $$render(consequent);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		const axis = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.each(node_2, 16, () => keys, (key) => key, ($$anchor, key) => {
				{
					let $0 = $.derived(() => context().xScale(key));

					Group($$anchor, {
						get x() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_3 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => scales.get(key)?.copy().range([context().height, 0]));

								Axis(node_3, {
									placement: 'left',
									get scale() {
										return $.get($0);
									},
									ticks: 6,
									rule: true
								});
							}

							var node_4 = $.sibling(node_3, 2);

							Text(node_4, {
								get value() {
									return dimensions[key];
								},
								y: -12,
								textAnchor: 'middle',
								class: 'text-xs font-medium fill-surface-content'
							});

							var node_5 = $.sibling(node_4, 2);

							Brush(node_5, {
								axis: 'y',
								x: -BRUSH_WIDTH / 2,
								width: BRUSH_WIDTH,
								classes: { selection: 'fill-primary/15 stroke-primary/50' },
								get state() {
									return brushes[key];
								},

								set state($$value) {
									brushes[key] = $$value;
								}
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				}
			});

			$.append($$anchor, fragment_2);
		};

		const marks = ($$anchor) => {
			Spline($$anchor, {
				stroke: (d) => $.get(selectedIds).has(d.id)
					? 'var(--color-primary)'
					: 'var(--color-surface-content)',
				strokeWidth: 1,
				opacity: (d) => $.get(selectedIds).has(d.id) ? 0.4 : 0.03
			});
		};

		let $0 = $.derived(scalePoint);

		Chart(node_1, {
			get data() {
				return data;
			},
			x: 'dimension',
			get xScale() {
				return $.get($0);
			},

			get xDomain() {
				return keys;
			},
			y: (d) => scales.get(d.dimension)?.(d.value),
			yDomain: [0, 1],
			z: 'id',
			padding: { left: 48, right: 48, top: 32, bottom: 8 },
			height: 400,
			axis,
			marks,
			$$slots: { axis: true, marks: true }
		});
	}

	$.template_effect(() => $.set_text(text, `${$.get(selectedIds).size ?? ''} of ${rows.length ?? ''} penguins `));
	$.append($$anchor, fragment);

	return $.pop($$exports);
}