import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Layer, RadialGradient } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Units($$anchor) {
	const radius = 50;

	Chart($$anchor, {
		height: 220,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 16, () => ({ length: 6 }), $.index, ($$anchor, _, i) => {
								Circle($$anchor, {
									cx: radius + i * 120,
									cy: radius,
									r: radius,
									get fill() {
										return gradient();
									}
								});
							});

							$.append($$anchor, fragment_3);
						};

						RadialGradient(node, {
							class: 'from-green-500 to-blue-500',
							units: 'objectBoundingBox',
							children,
							$$slots: { default: true }
						});
					}

					var node_2 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_5 = $.comment();
							var node_3 = $.first_child(fragment_5);

							$.each(node_3, 16, () => ({ length: 6 }), $.index, ($$anchor, _, i) => {
								Circle($$anchor, {
									cx: radius + i * 120,
									cy: 120 + radius,
									r: radius,
									get fill() {
										return gradient();
									}
								});
							});

							$.append($$anchor, fragment_5);
						};

						RadialGradient(node_2, {
							class: 'from-green-500 to-blue-500',
							units: 'userSpaceOnUse',
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