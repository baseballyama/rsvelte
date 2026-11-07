import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pie } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import ShowControl from '$lib/components/controls/fields/ShowField.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Tweened($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(void 0);
	const data = createDateSeries({ min: 20, max: 100, value: 'integer', count: 4 });

	const keyColors = [
		'var(--color-info)',
		'var(--color-success)',
		'var(--color-warning)',
		'var(--color-danger)'
	];

	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	ShowControl(node, {
		label: 'Show Pie',
		get show() {
			return $.get(show);
		},

		set show($$value) {
			$.set(show, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Chart(node_1, {
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
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							Pie($$anchor, { motion: 'tween' });
						};

						$.if(node_2, ($$render) => {
							if ($.get(show)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}