import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';
import { useRafFn } from '@svelteuidev/composables';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
	import { useRafFn } from '@svelteuidev/composables';

	let count = 0;
	const { pause, resume } = useRafFn(() => count++, {immediate: false});
<\/script>

<div>Count: {count}</div>
<Button on:click={() => pause()}>Pause</Button>
<Button on:click={() => resume()}>Resume</Button>
`;

export const type = 'demo';
export const configuration = { code };

export default function Options($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;
		const { pause, resume } = useRafFn(() => count++, { immediate: false });

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				$$renderer.push(`<div>Count: ${$.escape(count)}</div> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Pause`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Resume`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}