import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';
import { quadInOut } from 'svelte/easing';
import { piecewise, interpolateRgbBasis } from 'd3-interpolate';

export default function Bubble($$anchor, $$props) {
	$.push($$props, true);

	const pieces = piecewise([
		{ r: 0.005, alpha: 0.1 },
		{ r: 0.02, alpha: 0.9 },
		{ r: 0.005, alpha: 0.1 }
	]);

	const scale = (t) => pieces(quadInOut(t));
	const interpolate = interpolateRgbBasis(['tomato', 'goldenrod', 'mediumturquoise']);

	const render = ({ context, width, time }) => {
		const { r, alpha } = scale((time / 25 + $$props.i * 3) % 100 / 100);

		context.fillStyle = interpolate(1 - $$props.i / 50);
		context.globalAlpha = alpha;
		context.beginPath();
		context.arc($$props.x, $$props.y, r * width, 0, Math.PI * 2);
		context.fill();
	};

	Layer($$anchor, { render });
	$.pop();
}