import * as $ from 'svelte/internal/server';
import { Layer } from '$lib';
import { coords, activeLayer } from './store';

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		Layer($$renderer, {
			render: ({ context }) => {
				const [x, y] = $.store_get($$store_subs ??= {}, '$coords', coords);
				const text = `<${$.store_get($$store_subs ??= {}, '$activeLayer', activeLayer)?.name} />`;
				const size = 17;
				const tooltipX = x + size;
				const tooltipY = y + size;

				context.font = `${size}px 'Fira Mono', monospace`;
				context.textAlign = 'left';
				context.textBaseline = 'top';

				const { width: w } = context.measureText(text);
				const rect = [tooltipX - 2, tooltipY - 2, w + 4, size + 4];

				context.fillStyle = '#fff';
				context.globalAlpha = 0.9;
				context.fillRect(...rect);
				context.strokeRect(...rect);
				context.globalAlpha = 1;
				context.fillStyle = '#000';
				context.fillText(text, tooltipX, tooltipY);
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}