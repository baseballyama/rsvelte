import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Vector, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Basic($$anchor) {
	function circle(centerX, centerY, rotate) {
		return Array.from({ length: 12 }, (_, i) => {
			const angle = i * 30;
			const rad = angle * Math.PI / 180;

			return {
				cx: centerX + Math.sin(rad) * 60,
				cy: centerY - Math.cos(rad) * 60,
				rotate: rotate(angle)
			};
		});
	}

	const outward = circle(120, 150, (a) => a);
	const inward = circle(320, 150, (a) => a + 180);

	Chart($$anchor, {
		padding: { top: 10, bottom: 10, left: 10, right: 10 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.each(node, 17, () => outward, $.index, ($$anchor, v) => {
						Vector($$anchor, {
							get x() {
								return $.get(v).cx;
							},

							get y() {
								return $.get(v).cy;
							},
							length: 30,
							width: 5,
							get rotate() {
								return $.get(v).rotate;
							},
							class: 'stroke-primary'
						});
					});

					var node_1 = $.sibling(node, 2);

					$.each(node_1, 17, () => inward, $.index, ($$anchor, v) => {
						Vector($$anchor, {
							get x() {
								return $.get(v).cx;
							},

							get y() {
								return $.get(v).cy;
							},
							length: 30,
							width: 5,
							get rotate() {
								return $.get(v).rotate;
							},
							class: 'stroke-danger'
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}