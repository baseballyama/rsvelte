import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Concentric($$anchor, $$props) {
	$.push($$props, true);

	const data = {
		values: [
			{
				value: 400,
				domain: [0, 1000],
				fillClass: 'fill-red-500',
				trackClass: 'fill-red-500/10'
			},

			{
				value: 20,
				domain: [0, 30],
				fillClass: 'fill-lime-400',
				trackClass: 'fill-lime-400/10'
			},

			{
				value: 10,
				domain: [0, 12],
				fillClass: 'fill-cyan-400',
				trackClass: 'fill-cyan-500/10'
			}
		]
	};

	var $$exports = { data };

	Chart($$anchor, {
		height: 200,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Arc(node, {
						value: 400,
						domain: [0, 1000],
						innerRadius: -20,
						cornerRadius: 10,
						class: 'fill-red-500',
						track: { class: 'fill-red-500/10' }
					});

					var node_1 = $.sibling(node, 2);

					Arc(node_1, {
						value: 20,
						domain: [0, 30],
						outerRadius: -25,
						innerRadius: -20,
						cornerRadius: 10,
						class: 'fill-lime-400',
						track: { class: 'fill-lime-400/10' }
					});

					var node_2 = $.sibling(node_1, 2);

					Arc(node_2, {
						value: 10,
						domain: [0, 12],
						outerRadius: -50,
						innerRadius: -20,
						cornerRadius: 10,
						class: 'fill-cyan-400',
						track: { class: 'fill-cyan-500/10' }
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