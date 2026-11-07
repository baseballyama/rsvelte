import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Spreadmethod($$anchor) {
	const radius = 50;

	Chart($$anchor, {
		height: 100,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Circle($$anchor, {
								cx: radius + 0 * 120,
								cy: radius,
								r: radius,
								get fill() {
									return gradient();
								}
							});
						};

						RadialGradient(node, {
							class: 'from-green-500 to-blue-500',
							r: '30%',
							spreadMethod: 'pad',
							children,
							$$slots: { default: true }
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Circle($$anchor, {
								cx: radius + 1 * 120,
								cy: radius,
								r: radius,
								get fill() {
									return gradient();
								}
							});
						};

						RadialGradient(node_1, {
							class: 'from-green-500 to-blue-500',
							r: '30%',
							spreadMethod: 'reflect',
							children,
							$$slots: { default: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Circle($$anchor, {
								cx: radius + 2 * 120,
								cy: radius,
								r: radius,
								get fill() {
									return gradient();
								}
							});
						};

						RadialGradient(node_2, {
							class: 'from-green-500 to-blue-500',
							r: '30%',
							spreadMethod: 'repeat',
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}