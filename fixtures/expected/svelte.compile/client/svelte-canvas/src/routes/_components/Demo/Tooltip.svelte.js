import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layer } from '$lib';
import { coords, activeLayer } from './store';

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	const $coords = () => $.store_get(coords, '$coords', $$stores);
	const $activeLayer = () => $.store_get(activeLayer, '$activeLayer', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	Layer($$anchor, {
		render: ({ context }) => {
			const [x, y] = $coords();
			const text = `<${$activeLayer()?.name} />`;
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

	$.pop();
	$$cleanup();
}