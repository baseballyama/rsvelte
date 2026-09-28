import * as $ from 'svelte/internal/server';
import { Group } from '@svelteuidev/core';
import { useHash } from '@svelteuidev/composables';

const code = `
<script>
	import { useHash } from '@svelteuidev/composables';

	const id = useHash('sveleteui');
<\/script>

<p>Generated hash: {id}</p>
`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = useHash('sveleteui');

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				$$renderer.push(`<p>Generated hash: <b>${$.escape(id)}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}