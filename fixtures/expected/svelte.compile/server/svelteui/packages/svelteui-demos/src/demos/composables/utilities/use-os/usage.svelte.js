import * as $ from 'svelte/internal/server';
import { Box } from '@svelteuidev/core';
import { useOs } from '@svelteuidev/composables';

const code = `
<script>
	import { useOs } from '@svelteuidev/composables';
	const os = useOs();
<\/script>

<p>Your OS is <b>{os}</b></p>
`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const os = useOs();

		Box($$renderer, {
			css: { d: 'flex', jc: 'center' },
			children: ($$renderer) => {
				$$renderer.push(`<p>Your OS is <b>${$.escape(os)}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}