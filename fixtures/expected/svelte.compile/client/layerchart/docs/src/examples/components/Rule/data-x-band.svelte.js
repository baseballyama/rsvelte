import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Rule } from 'layerchart';
import { csvParse, autoType } from 'd3-dsv';
import { sortFunc } from '@layerstack/utils';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Data_x_band($$anchor, $$props) {
	$.push($$props, true);

	const data = csvParse(
		`letter,frequency
		E,0.12702
		T,0.09056
		A,0.08167
		O,0.07507
		I,0.06966
		N,0.06749
		S,0.06327
		H,0.06094
		R,0.05987
		D,0.04253
		L,0.04025
		C,0.02782
		U,0.02758
		M,0.02406
		W,0.0236
		F,0.02288
		G,0.02015
		Y,0.01974
		P,0.01929
		B,0.01492
		V,0.00978
		K,0.00772
		J,0.00153
		X,0.0015
		Q,0.00095
		Z,0.00074`,
		autoType
	).sort(sortFunc('letter'));

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'letter',
		y: 'frequency',
		yNice: true,
		padding: { left: 25, bottom: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left' });

					var node_2 = $.sibling(node_1, 2);

					Rule(node_2, { class: 'stroke-2 stroke-primary stroke-4' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}