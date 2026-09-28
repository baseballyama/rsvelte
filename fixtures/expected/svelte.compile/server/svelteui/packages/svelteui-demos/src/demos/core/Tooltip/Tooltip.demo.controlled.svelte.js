import * as $ from 'svelte/internal/server';
import { Button, Center, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';

  let opened = false;
<\/script>

<Tooltip {opened} label='Hello'>
    <Button on:click={() => (opened = !opened)}>Click here</Button>
</Tooltip>
`;

export const type = 'demo';
export const configuration = { code };

export default function Tooltip_demo_controlled($$renderer) {
	let opened = false;

	Center($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				opened,
				label: 'Hello',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click here`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}