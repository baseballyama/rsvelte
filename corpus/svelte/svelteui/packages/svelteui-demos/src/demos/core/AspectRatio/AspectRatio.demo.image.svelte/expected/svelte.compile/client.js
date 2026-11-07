import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AspectRatio, Image } from '@svelteuidev/core';

const code = `<script>
	import {  AspectRatio, Image } from '@svelteuidev/core';
<\/script>

<AspectRatio ratio={16 / 9}>
	<Image
		src="https://images.unsplash.com/photo-1527118732049-c88155f2107c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80"
		alt="Panda"
	/>
</AspectRatio>`;

export const type = 'demo';
export const configuration = { code };

export default function AspectRatio_demo_image($$anchor) {
	AspectRatio($$anchor, {
		ratio: 16 / 9,
		style: 'max-width: 300px',
		children: ($$anchor, $$slotProps) => {
			Image($$anchor, {
				src: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=720&q=80',
				alt: 'Panda'
			});
		},
		$$slots: { default: true }
	});
}