import * as $ from 'svelte/internal/server';
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

export default function Overlay_demo_content($$renderer) {
	Overlay($$renderer, {
		opacity: 0.6,
		color: '#000',
		zIndex: 5,
		center: true,
		children: ($$renderer) => {
			Text($$renderer, {
				override: { color: 'white', marginTop: '10px' },
				children: ($$renderer) => {
					$$renderer.push(`<!---->This text is now selectable`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}