import * as $ from 'svelte/internal/server';
import { Box, Button, Overlay } from '@svelteuidev/core';

const code = `<script>
	import { Box, Button, Overlay } from '@svelteuidev/core';
<\/script>

<Box>
    <Button>Under overlay</Button>
    <Overlay gradient={'linear-gradient(105deg, black 20%, #312f2f 50%, $gray400 100%)''} />
</Box>`;

export const type = 'demo';
export const configuration = { code };

export default function Overlay_demo_gradient($$renderer) {
	Box($$renderer, {
		css: {
			position: 'relative',
			height: 200,
			width: '100%',
			maxWidth: 400,
			marginLeft: 'auto',
			marginRight: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		},

		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Under overlay`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Overlay($$renderer, {
				gradient: `linear-gradient(105deg, black 20%, #312f2f 50%, $gray400 100%)`
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}