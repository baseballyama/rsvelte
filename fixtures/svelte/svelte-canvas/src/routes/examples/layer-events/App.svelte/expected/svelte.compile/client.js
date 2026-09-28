import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '$lib';
import Ball from './Ball.svelte';

export default function App($$anchor, $$props) {
	$.push($$props, true);

	let balls = [
		{ color: 'tomato', x: 0.5, y: 0.333 },
		{ color: 'goldenrod', x: 0.333, y: 0.625 },
		{ color: 'mediumturquoise', x: 0.667, y: 0.625 }
	];

	const reorder = (color) => {
		balls = balls.filter((c) => c.color !== color).concat(balls.filter((c) => c.color === color));
	};

	Canvas($$anchor, {
		layerEvents: true,
		style: 'touch-action: none',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => balls, ({ color, x, y }) => color, ($$anchor, $$item) => {
				let color = () => $.get($$item).color;
				let x = () => $.get($$item).x;
				let y = () => $.get($$item).y;

				Ball($$anchor, {
					get color() {
						return color();
					},

					get x() {
						return x();
					},

					get y() {
						return y();
					},
					onclick: () => reorder(color())
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}