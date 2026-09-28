import * as $ from 'svelte/internal/server';
import { Canvas, Layer } from '$lib';
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { quadOut as easing } from 'svelte/easing';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const position = tweened([0.5, 0.5], { duration: 400, easing });

		onMount(() => {
			setInterval(() => $.store_set(position, [Math.random(), Math.random()]), 1000);
		});

		const render = ({ context, width, height }) => {
			const [x, y] = $.store_get($$store_subs ??= {}, '$position', position);

			context.fillStyle = 'tomato';
			context.beginPath();
			context.arc(x * width, y * height, 20, 0, 2 * Math.PI);
			context.fill();
		};

		Canvas($$renderer, {
			children: ($$renderer) => {
				Layer($$renderer, { render });
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}