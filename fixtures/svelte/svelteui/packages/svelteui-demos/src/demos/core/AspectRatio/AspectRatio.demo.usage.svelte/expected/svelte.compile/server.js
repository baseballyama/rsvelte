import * as $ from 'svelte/internal/server';
import { AspectRatio } from '@svelteuidev/core';

const code = `<script>
	import { AspectRatio } from '@svelteuidev/core';
<\/script>

<AspectRatio ratio={3 / 5}>
	<div style="background-color: purple">Aspect Ratio</div>
</AspectRatio>`;

export const type = 'demo';
export const configuration = { code };

export default function AspectRatio_demo_usage($$renderer) {
	AspectRatio($$renderer, {
		ratio: 3 / 5,
		style: 'max-width: 200px',
		children: ($$renderer) => {
			$$renderer.push(`<div style="background-color: purple">Aspect Ratio</div>`);
		},
		$$slots: { default: true }
	});
}