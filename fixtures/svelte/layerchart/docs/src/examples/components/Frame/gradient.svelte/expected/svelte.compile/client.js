import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Frame, Layer, LinearGradient } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Gradient($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Frame($$anchor, {
								class: 'stroke-primary/10',
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node, {
							class: 'from-primary/10 to-secondary/10',
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'bottom' });

					var node_2 = $.sibling(node_1, 2);

					Axis(node_2, { placement: 'left' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}