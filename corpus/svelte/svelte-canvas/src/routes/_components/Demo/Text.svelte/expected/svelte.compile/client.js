import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DemoLayer from './DemoLayer.svelte';

export default function Text($$anchor, $$props) {
	let opacity = $.prop($$props, 'opacity', 3, 1),
		yOffset = $.prop($$props, 'yOffset', 3, 0);

	DemoLayer($$anchor, {
		name: 'Text',
		render: ({ context, width, height, active }) => {
			const size = width * $$props.scale;
			const offset = height * yOffset();

			context.font = `${size}px 'Fira Mono', monospace`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = '#dcdcdc';
			context.globalAlpha = opacity();
			context.fillText($$props.text, width / 2, height / 2 + offset);

			const { width: w } = context.measureText($$props.text);
			const rect = [width / 2 - w / 2, height / 2 - size / 2 + offset, w, size];

			context.globalAlpha = 0;
			context.fillRect(...rect);
			context.globalAlpha = 1;

			if (active()) {
				context.strokeRect(...rect);
			}
		}
	});
}