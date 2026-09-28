import * as $ from 'svelte/internal/server';
import { Canvas } from '$lib';
import Ball from './Ball.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let balls = [
			{ color: 'tomato', x: 0.5, y: 0.333 },
			{ color: 'goldenrod', x: 0.333, y: 0.625 },
			{ color: 'mediumturquoise', x: 0.667, y: 0.625 }
		];

		const reorder = (color) => {
			balls = balls.filter((c) => c.color !== color).concat(balls.filter((c) => c.color === color));
		};

		Canvas($$renderer, {
			layerEvents: true,
			style: 'touch-action: none',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(balls);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { color, x, y } = each_array[$$index];

					Ball($$renderer, { color, x, y, onclick: () => reorder(color) });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}