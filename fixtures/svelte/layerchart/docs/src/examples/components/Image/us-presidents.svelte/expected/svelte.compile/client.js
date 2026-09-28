import 'svelte/internal/disclose-version';
import { getUsPresidents } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Image, Layer } from 'layerchart';

const data = await getUsPresidents();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Us_presidents($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'inaugurationDate',
		y: 'veryFavorable',
		yNice: true,
		padding: { top: 20, bottom: 30, left: 36, right: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', label: 'Inauguration', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', label: 'Very favorable %', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Image(node_2, {
						href: 'portraitUrl',
						x: 'inaugurationDate',
						y: 'veryFavorable',
						r: 18,
						preserveAspectRatio: 'xMidYMid slice'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}