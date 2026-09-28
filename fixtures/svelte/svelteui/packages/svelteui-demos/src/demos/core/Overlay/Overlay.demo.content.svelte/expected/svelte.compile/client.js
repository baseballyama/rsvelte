import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Overlay, Text } from '@svelteuidev/core';

const code = `<script>
	import { Overlay, Text } from '@svelteuidev/core';
<\/script>

<Overlay opacity={0.6} color="#000" zIndex={5} center>
	<Text>This text is now selectable</Text>
</Overlay>
`;

export const type = 'demo';
export const configuration = { code };

export default function Overlay_demo_content($$anchor) {
	Overlay($$anchor, {
		opacity: 0.6,
		color: '#000',
		zIndex: 5,
		center: true,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				override: { color: 'white', marginTop: '10px' },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This text is now selectable');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}