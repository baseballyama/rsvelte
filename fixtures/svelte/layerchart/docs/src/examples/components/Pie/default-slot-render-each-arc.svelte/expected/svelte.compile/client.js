import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Default_slot_render_each_arc($$anchor, $$props) {
	$.push($$props, true);

	// fixed data (same as disable-sorting example to call attention to what sorting does)
	const data = [
		{ date: '2025-11-04T05:00:00.000Z', value: 99 },
		{ date: '2025-11-05T05:00:00.000Z', value: 84 },
		{ date: '2025-11-06T05:00:00.000Z', value: 90 },
		{ date: '2025-11-07T05:00:00.000Z', value: 67 }
	];

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'value',
		c: 'date',
		get cRange() {
			return keyColors;
		},
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let arcs = () => ($$arg0?.()).arcs;
							var fragment_3 = $.comment();
							var node = $.first_child(fragment_3);

							$.each(node, 17, arcs, $.index, ($$anchor, arc, index) => {
								Arc($$anchor, {
									get startAngle() {
										return $.get(arc).startAngle;
									},

									get endAngle() {
										return $.get(arc).endAngle;
									},

									get padAngle() {
										return $.get(arc).padAngle;
									},

									get fill() {
										return keyColors[index];
									},
									offset: index === 0 ? 16 : 0
								});
							});

							$.append($$anchor, fragment_3);
						};

						Pie($$anchor, { children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}