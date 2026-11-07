import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, Layer } from '$lib';
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { quadOut as easing } from 'svelte/easing';

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const $position = () => $.store_get(position, '$position', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const position = tweened([0.5, 0.5], { duration: 400, easing });

	onMount(() => {
		setInterval(() => $.store_set(position, [Math.random(), Math.random()]), 1000);
	});

	const render = ({ context, width, height }) => {
		const [x, y] = $position();

		context.fillStyle = 'tomato';
		context.beginPath();
		context.arc(x * width, y * height, 20, 0, 2 * Math.PI);
		context.fill();
	};

	Canvas($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, { render });
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}