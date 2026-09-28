import * as $ from 'svelte/internal/server';
import { Layer } from '$lib';

export default function Background($$renderer) {
	const render = ({ context, width, height }) => {
		const w = width / 2;
		const h = height / 2;
		const gradient = context.createRadialGradient(w, h, 0, w, h, height);

		gradient.addColorStop(0, '#222');
		gradient.addColorStop(1, '#000');
		context.globalCompositeOperation = 'lighten';
		context.fillStyle = gradient;
		context.fillRect(0, 0, width, height);
	};

	Layer($$renderer, { render });
}