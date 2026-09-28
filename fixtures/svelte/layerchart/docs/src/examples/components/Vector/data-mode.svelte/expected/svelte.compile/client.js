import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Vector, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Data_mode($$anchor) {
	const cols = 30;
	const rows = 14;

	const data = Array.from({ length: cols * rows }, (_, i) => ({
		x: i % cols * (100 / cols) + 100 / cols / 2,
		y: Math.floor(i / cols) * 7 + 3.5
	}));

	let mouseX = $.state(50);
	let mouseY = $.state(50);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				onpointermove: (e) => {
					const x = e.offsetX - context().padding.left;
					const y = e.offsetY - context().padding.top;

					$.set(mouseX, context().xScale.invert?.(x) ?? x, true);
					$.set(mouseY, context().yScale.invert?.(y) ?? y, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true });

					var node_2 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => data.map((d) => {
							const dx = $.get(mouseX) - d.x;
							const dy = $.get(mouseY) - d.y;
							const dist = Math.sqrt(dx * dx + dy * dy);

							return {
								...d,
								direction: Math.atan2(dx, dy) * (180 / Math.PI),
								speed: Math.min(dist / 5, 14)
							};
						}));

						Vector(node_2, {
							get data() {
								return $.get($0);
							},
							x: 'x',
							y: 'y',
							length: 'speed',
							rotate: 'direction',
							class: 'stroke-primary'
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, {
			x: 'x',
			y: 'y',
			r: 'speed',
			xDomain: [0, 100],
			yDomain: [0, 100],
			rDomain: [0, 14],
			rRange: [2, 16],
			padding: { top: 10, bottom: 20, left: 24, right: 10 },
			height: 300,
			children,
			$$slots: { default: true }
		});
	}
}