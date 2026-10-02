import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Tailwind_colors($$anchor) {
	const radius = 50;

	Chart($$anchor, {
		height: 220,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					RadialGradient(node, { id: 'tw-1', class: 'from-pink-500 to-yellow-500' });

					var node_1 = $.sibling(node, 2);

					RadialGradient(node_1, { id: 'tw-2', class: 'from-green-300 to-purple-600' });

					var node_2 = $.sibling(node_1, 2);

					RadialGradient(node_2, { id: 'tw-3', class: 'from-gray-600 to-black' });

					var node_3 = $.sibling(node_2, 2);

					RadialGradient(node_3, { id: 'tw-4', class: 'from-pink-300 to-indigo-400' });

					var node_4 = $.sibling(node_3, 2);

					RadialGradient(node_4, { id: 'tw-5', class: 'from-yellow-100 to-yellow-500' });

					var node_5 = $.sibling(node_4, 2);

					RadialGradient(node_5, { id: 'tw-6', class: 'from-blue-700 to-gray-900' });

					var node_6 = $.sibling(node_5, 2);

					RadialGradient(node_6, { id: 'tw-7', class: 'from-sky-300 to-blue-500' });

					var node_7 = $.sibling(node_6, 2);

					RadialGradient(node_7, { id: 'tw-8', class: 'from-red-500 to-red-800' });

					var node_8 = $.sibling(node_7, 2);

					RadialGradient(node_8, { id: 'tw-9', class: 'from-blue-400 to-emerald-400' });

					var node_9 = $.sibling(node_8, 2);

					$.each(node_9, 16, () => ({ length: 9 }), $.index, ($$anchor, _, i) => {
						{
							let $0 = $.derived(() => radius + 120 * Math.floor(i / 5));

							Circle($$anchor, {
								cx: radius + 120 * (i % 5),
								get cy() {
									return $.get($0);
								},
								r: radius,
								fill: `url(#tw-${i + 1})`
							});
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}