import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<canvas class="svelte-11xh1q4"></canvas>`);

export default function Bind_this_input($$anchor, $$props) {
	$.push($$props, true);

	let canvas;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		let frame = requestAnimationFrame(loop);

		function loop(t) {
			frame = requestAnimationFrame(loop);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			for (let p = 0; p < imageData.data.length; p += 4) {
				const i = p / 4;
				const x = i % canvas.width;
				const y = i / canvas.height >>> 0;
				const r = 64 + 128 * x / canvas.width + 64 * Math.sin(t / 1000);
				const g = 64 + 128 * y / canvas.height + 64 * Math.cos(t / 1000);
				const b = 128;

				imageData.data[p + 0] = r;
				imageData.data[p + 1] = g;
				imageData.data[p + 2] = b;
				imageData.data[p + 3] = 255;
			}

			ctx.putImageData(imageData, 0, 0);
		}

		return () => {
			cancelAnimationFrame(frame);
		};
	});

	var canvas_1 = root();

	$.set_attribute(canvas_1, 'width', 32);
	$.set_attribute(canvas_1, 'height', 32);
	$.bind_this(canvas_1, ($$value) => canvas = $$value, () => canvas);
	$.append($$anchor, canvas_1);
	$.pop();
}