import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'bounds', 'show']);

export default function ResizableLayerSurface($$anchor, $$props) {
	let show = $.prop($$props, 'show', 3, false),
		eventHandlers = $.rest_props($$props, rest_excludes);

	const render = ({ context }) => {
		const { x0, y0, x1, y1 } = $$props.bounds;

		if (show()) {
			context.strokeStyle = '#444';
			context.lineWidth = 2;
			context.strokeRect(x0, y0, x1 - x0, y1 - y0);
		}

		context.globalAlpha = 0;
		context.fillRect(x0, y0, x1 - x0, y1 - y0);
		context.globalAlpha = 1;
	};

	Layer($$anchor, $.spread_props({ render }, () => eventHandlers));
}