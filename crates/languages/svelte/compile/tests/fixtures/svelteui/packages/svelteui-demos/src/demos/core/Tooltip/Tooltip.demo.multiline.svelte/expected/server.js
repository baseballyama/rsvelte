import * as $ from 'svelte/internal/server';
import { Button, Center, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';
<\/script>

<Tooltip
    wrapLines
    width={220}
    withArrow
    transitionDuration={200}
    label='Use this button to see the tooltip multiline behavior so that we can convince you to use this library.'
>
    <Button>Multiline tooltip</Button>
</Tooltip>
`;

export const type = 'demo';
export const configuration = { code };

export default function Tooltip_demo_multiline($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				wrapLines: true,
				width: 220,
				withArrow: true,
				transitionDuration: 200,
				label: 'Use this button to see the tooltip multiline behavior so that we can convince you to use this library.',
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Multiline tooltip`);
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