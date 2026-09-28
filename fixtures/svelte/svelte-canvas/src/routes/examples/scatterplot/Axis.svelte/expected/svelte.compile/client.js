import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';

export default function Axis($$anchor, $$props) {
	$.push($$props, true);

	const tickSize = $.prop($$props, 'tickSize', 3, 4),
		tickNumber = $.prop($$props, 'tickNumber', 3, 10),
		type = $.prop($$props, 'type', 3, 'x');

	const render = ({ context, height }) => {
		const ticks = $$props.scale.ticks(tickNumber());

		context.beginPath();

		ticks.forEach((d) => {
			if (type() === 'x') {
				context.moveTo($$props.scale(d), height - $$props.margin.bottom);
				context.lineTo($$props.scale(d), height - $$props.margin.bottom + tickSize());
			} else if (type() === 'y') {
				context.moveTo($$props.margin.left, $$props.scale(d));
				context.lineTo($$props.margin.left - tickSize(), $$props.scale(d));
			}
		});

		context.strokeStyle = '#ccc';
		context.stroke();
		context.textAlign = type() === 'x' ? 'center' : 'right';
		context.textBaseline = type() === 'x' ? 'top' : 'middle';
		context.fillStyle = '#ccc';

		ticks.forEach((d) => {
			if (type() === 'x') {
				context.fillText(d, $$props.scale(d), height - $$props.margin.bottom + tickSize() + 1);
			} else if (type() === 'y') {
				context.fillText(d, $$props.margin.left - tickSize() - 1, $$props.scale(d));
			}
		});
	};

	Layer($$anchor, { render });
	$.pop();
}