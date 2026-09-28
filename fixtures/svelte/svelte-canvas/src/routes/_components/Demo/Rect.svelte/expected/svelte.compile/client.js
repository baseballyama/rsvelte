import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoLayer from './DemoLayer.svelte';

export default function Rect($$anchor) {
	DemoLayer($$anchor, {
		name: 'Rect',
		render: ({ context, width, height, active }) => {
			const rect = [width * 0.2, height * 0.14, width * 0.2, width * 0.12];

			context.fillStyle = 'tomato';
			context.fillRect(...rect);

			if (active()) {
				context.strokeRect(...rect);
			}
		}
	});
}