import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { paint } from './gradient.js';

var root = $.from_html(`<canvas></canvas>`);

export default function Attach03_input($$anchor, $$props) {
	$.push($$props, true);

	var canvas_1 = root();

	$.set_attribute(canvas_1, 'width', 32);
	$.set_attribute(canvas_1, 'height', 32);

	$.attach(canvas_1, () => (canvas) => {
		const context = canvas.getContext('2d');

		$.user_effect(() => {
			let frame = requestAnimationFrame(function loop(t) {
				frame = requestAnimationFrame(loop);
				paint(context, t);
			});

			return () => {
				cancelAnimationFrame(frame);
			};
		});
	});

	$.append($$anchor, canvas_1);
	$.pop();
}