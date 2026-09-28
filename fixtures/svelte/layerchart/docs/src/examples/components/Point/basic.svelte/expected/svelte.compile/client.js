import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Circle, Point, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	let data = [];

	var $$exports = {
		get data() {
			return data;
		},

		set data($$value) {
			data = $$value;
		}
	};

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: (d) => d.x,
		y: (d) => d.y,
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 10, bottom: 20, left: 24, right: 10 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true });

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let x = () => ($$arg0?.()).x;
							let y = () => ($$arg0?.()).y;

							Circle($$anchor, {
								get cx() {
									return x();
								},

								get cy() {
									return y();
								},
								r: 10
							});
						};

						Point(node_2, { d: { x: 50, y: 50 }, children, $$slots: { default: true } });
					}

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let x = () => ($$arg0?.()).x;
							let y = () => ($$arg0?.()).y;

							Circle($$anchor, {
								get cx() {
									return x();
								},

								get cy() {
									return y();
								},
								r: 15,
								class: 'fill-primary bg-primary'
							});
						};

						Point(node_3, { d: { x: 20, y: 20 }, children, $$slots: { default: true } });
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	return $.pop($$exports);
}