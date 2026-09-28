import * as $ from 'svelte/internal/server';
import { Stack, Button } from '@svelteuidev/core';
import { useHash } from '@svelteuidev/composables';

const code = `
<script>
	import { useHash } from '@svelteuidev/composables';

	const id = useHash('my-library', true);
<\/script>

<p>Generated hash that won't change: <b>{id}</b></p>
`;

export const type = 'demo';
export const configuration = { code };

export default function Persist($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = useHash('my-library', true);

		Stack($$renderer, {
			align: 'center',
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click to refresh the page`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p>Generated hash that won't change: <b>${$.escape(id)}</b></p>`);
			},
			$$slots: { default: true }
		});
	});
}