import * as $ from 'svelte/internal/server';
import { Box, Button, Group, Overlay, Text } from '@svelteuidev/core';

const code = `<script>
	import { Box, Button, Group, Overlay } from '@svelteuidev/core';

  let visible = false;
<\/script>

<Box>
    {#if visible}
        <Overlay opacity={0.6} color="#000" zIndex={5} blur={2} />
    {/if}
    Overlay with a blur
</Box>

<Group children={1} position="center">
    <Button on:click={() => visible = !visible}>Toggle overlay</Button>
</Group>`;

export const type = 'demo';
export const configuration = { code };

export default function Overlay_demo_blur($$renderer) {
	let visible = false;

	Box($$renderer, {
		css: { height: 50, position: 'relative' },
		children: ($$renderer) => {
			if (visible) {
				$$renderer.push('<!--[0-->');
				Overlay($$renderer, { opacity: 0.6, color: '#000', zIndex: 5, blur: 2 });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Text($$renderer, {
				align: 'center',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Overlay with a blur`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Group($$renderer, {
		children: 1,
		position: 'center',
		$$slots: {
			default: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle overlay`);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$$renderer.push(`<!---->`);
}