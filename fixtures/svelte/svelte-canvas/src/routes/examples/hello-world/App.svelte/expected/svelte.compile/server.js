import * as $ from 'svelte/internal/server';
import { Canvas, Layer } from '$lib';

export default function App($$renderer) {
	const render = ({ context, width, height }) => {
		context.font = `${width / 10}px sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = 'tomato';
		context.fillText('hello world', width / 2, height / 2);
	};

	Canvas($$renderer, {
		children: ($$renderer) => {
			Layer($$renderer, { render });
		},
		$$slots: { default: true }
	});
}