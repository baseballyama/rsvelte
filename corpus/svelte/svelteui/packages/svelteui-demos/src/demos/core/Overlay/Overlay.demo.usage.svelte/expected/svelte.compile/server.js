import * as $ from 'svelte/internal/server';
import { Box, Button, Group, Overlay, Text } from '@svelteuidev/core';

const code = `
<script>
	import { Box, Button, Group, Overlay, Text } from '@svelteuidev/core';

  let visible = false;
  let count = 0;
<\/script>

<Box>
    {#if visible}
        <Overlay opacity={0.6} color="#000" zIndex={5} />
    {/if}
    <Button on:click={() => count++} color={visible ? 'red' : 'teal'}>
        {!visible ? 'Click as much as you like' : "Won't click, haha"}
    </Button>
</Box>
<Group children={2} direction='column' position="center">
    <Text>Count: {count}</Text>
    <Button on:click={() => visible = !visible}>Toggle overlay</Button>
</Group>`;

export const type = 'demo';
export const configuration = { code };

export default function Overlay_demo_usage($$renderer) {
	let visible = false;
	let count = 0;

	Box($$renderer, {
		css: {
			display: 'flex',
			justifyContent: 'center',
			height: 60,
			position: 'relative',
			textAlign: 'center'
		},

		children: ($$renderer) => {
			if (visible) {
				$$renderer.push('<!--[0-->');
				Overlay($$renderer, { opacity: 0.6, color: '#000', zIndex: 5 });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Button($$renderer, {
				color: visible ? 'red' : 'teal',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(!visible ? 'Click as much as you like' : "Won't click, haha")}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Group($$renderer, {
		children: 2,
		direction: 'column',
		position: 'center',
		$$slots: {
			default: ($$renderer) => {
				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Count: ${$.escape(count)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle overlay`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}