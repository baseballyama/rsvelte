import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';
import { spring } from 'svelte/motion';

export default function Point($$anchor, $$props) {
	$.push($$props, true);

	const $radius = () => $.store_get(radius, '$radius', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const x = $.prop($$props, 'x', 3, 0),
		y = $.prop($$props, 'y', 3, 0),
		r = $.prop($$props, 'r', 3, 1),
		fill = $.prop($$props, 'fill', 3, 'black'),
		stroke = $.prop($$props, 'stroke', 3, null),
		strokeWidth = $.prop($$props, 'strokeWidth', 3, 1);

	const radius = spring(r(), { stiffness: 0.15, damping: 0.3 });

	$.user_effect(() => {
		radius.set(r());
	});

	const render = ({ context }) => {
		const r = Math.max($radius(), 0);

		context.fillStyle = fill();
		context.beginPath();
		context.arc(x(), y(), r, 0, 2 * Math.PI);
		context.fill();

		if (stroke()) {
			context.strokeStyle = stroke();
			context.lineWidth = strokeWidth();
			context.beginPath();
			context.arc(x(), y(), r + strokeWidth() / 2, 0, 2 * Math.PI);
			context.stroke();
		}
	};

	Layer($$anchor, { render });
	$.pop();
	$$cleanup();
}