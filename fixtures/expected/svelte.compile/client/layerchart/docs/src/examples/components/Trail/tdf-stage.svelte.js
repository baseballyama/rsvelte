import 'svelte/internal/disclose-version';
import { getTdfStage } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Spline, Trail } from 'layerchart';

const data = await getTdfStage();

export const title = 'Tour de France Stage Profile';
export const description = 'Elevation profile of a Tour de France stage using trail width to encode elevation.';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Tdf_stage($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'long',
		y: 'lat',
		r: 'elev',
		rRange: [1, 20],
		padding: { left: 50, bottom: 30 },
		height: 500,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'left', grid: true, label: 'Latitude' });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'bottom', label: 'Longitude' });

					var node_2 = $.sibling(node_1, 2);

					Trail(node_2, { class: 'fill-danger/40' });

					var node_3 = $.sibling(node_2, 2);

					Spline(node_3, { class: 'stroke-1 stroke-surface-content' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}