import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas, Layer } from '$lib';

export default function App($$anchor) {
	const render = ({ context, width, height }) => {
		context.font = `${width / 10}px sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = 'tomato';
		context.fillText('hello world', width / 2, height / 2);
	};

	Canvas($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, { render });
		},
		$$slots: { default: true }
	});
}