import 'svelte/internal/disclose-version';
import { getPenguins } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Frame } from 'layerchart';

const penguins = await getPenguins();
var root = $.from_html(`<!> <!>`, 1);

export default function Facet_two_dimensional($$anchor, $$props) {
	$.push($$props, true);

	// Rows missing a measurement are dropped, but a missing `sex` is kept — it becomes the
	// rightmost column
	const data = penguins.filter((d) => d.bill_length_mm !== 'NA' && d.bill_depth_mm !== 'NA');

	var $$exports = { data };

	{
		const marks = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Frame(node, { class: 'stroke-surface-content/20 fill-none' });

			var node_1 = $.sibling(node, 2);

			Circle(node_1, {
				cx: 'bill_length_mm',
				cy: 'bill_depth_mm',
				r: 2.5,
				fill: 'var(--color-primary)',
				fillOpacity: 0.7
			});

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'bill_length_mm',
			y: 'bill_depth_mm',
			fx: 'sex',
			fy: 'species',
			fxDomain: ['female', 'male', 'NA'],
			xNice: true,
			yNice: true,
			grid: true,
			padding: { left: 44, bottom: 32, top: 24, right: 72 },
			height: 480,
			marks,
			$$slots: { marks: true }
		});
	}

	return $.pop($$exports);
}