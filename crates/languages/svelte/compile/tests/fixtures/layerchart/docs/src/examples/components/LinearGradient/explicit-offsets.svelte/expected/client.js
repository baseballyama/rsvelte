import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, LinearGradient, Rect } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Explicit_offsets($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node, {
							stops: [['30%', 'hsl(60 100% 50%)'], ['70%', 'hsl(30 100% 40%)']],
							children,
							$$slots: { default: true }
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_1, {
							stops: [['10%', 'hsl(60 100% 50%)'], ['90%', 'hsl(140 100% 40%)']],
							rotate: 45,
							children,
							$$slots: { default: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

							Rect($$anchor, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});
						};

						LinearGradient(node_2, {
							stops: [['50%', 'hsl(195 100% 50%)'], ['50%', 'hsl(270 100% 30%)']],
							vertical: true,
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