import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<canvas class="pointer-events-none absolute top-0 left-0 h-screen w-screen"></canvas>`);

export default function Noise($$anchor, $$props) {
	$.push($$props, true);

	let patternSize = $.prop($$props, 'patternSize', 3, 250),
		patternScaleX = $.prop($$props, 'patternScaleX', 3, 1),
		patternScaleY = $.prop($$props, 'patternScaleY', 3, 1),
		patternRefreshInterval = $.prop($$props, 'patternRefreshInterval', 3, 2),
		patternAlpha = $.prop($$props, 'patternAlpha', 3, 15);

	let canvas = $.state(void 0);

	$.user_effect(() => {
		// Touch all props so the effect re-runs when they change (matches React deps).
		void patternSize();

		void patternScaleX();
		void patternScaleY();

		const refreshInterval = patternRefreshInterval();
		const alpha = patternAlpha();

		if (!$.get(canvas)) return;

		const ctx = $.get(canvas).getContext('2d', { alpha: true });

		if (!ctx) return;

		let frame = 0;
		let animationId = 0;
		const canvasSize = 1024;

		const resize = () => {
			if (!$.get(canvas)) return;

			$.get(canvas).width = canvasSize;
			$.get(canvas).height = canvasSize;
			$.get(canvas).style.width = '100vw';
			$.get(canvas).style.height = '100vh';
		};

		const drawGrain = () => {
			const imageData = ctx.createImageData(canvasSize, canvasSize);
			const data = imageData.data;

			for (let i = 0; i < data.length; i += 4) {
				const value = Math.random() * 255;

				data[i] = value;
				data[i + 1] = value;
				data[i + 2] = value;
				data[i + 3] = alpha;
			}

			ctx.putImageData(imageData, 0, 0);
		};

		const loop = () => {
			if (frame % refreshInterval === 0) drawGrain();

			frame++;
			animationId = window.requestAnimationFrame(loop);
		};

		window.addEventListener('resize', resize);
		resize();
		loop();

		return () => {
			window.removeEventListener('resize', resize);
			window.cancelAnimationFrame(animationId);
		};
	});

	var canvas_1 = root();

	$.set_style(canvas_1, '', {}, { 'image-rendering': 'pixelated' });
	$.bind_this(canvas_1, ($$value) => $.set(canvas, $$value), () => $.get(canvas));
	$.append($$anchor, canvas_1);
	$.pop();
}