import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { useId } from '@svelteuidev/composables';

const code = `
<script>
	import { useId } from '@svelteuidev/composables';

	const uuid = useId()
<\/script>
	
<p>Generated Id: <b>{uuid}</b></p>
`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uuid = useId();

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				$$renderer.push(`<p>Generated Id: <b>${$.escape(uuid)}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}