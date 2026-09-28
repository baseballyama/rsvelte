import * as $ from 'svelte/internal/server';
import { Center, Box } from '@svelteuidev/core';
import { ArrowLeft } from 'radix-icons-svelte';

const code = `
    <script>
        import { Anchor, Center, Box } from '@svelteuidev/core';
    <\/script>
    
    <Anchor href="https://svelteui.dev" target="_blank">
      <Center inline>
        <ArrowLeft size={14} />
        <Box css={{ ml: 5 }}>Back to SvelteUI website</Box>
      </Center>
    </Anchor>
	`;

export const type = 'demo';
export const configuration = { code };

export default function Center_demo_inline($$renderer) {
	Box($$renderer, {
		css: { color: '$blue600' },
		root: 'a',
		href: '/',
		target: '_blank',
		children: ($$renderer) => {
			Center($$renderer, {
				inline: true,
				children: ($$renderer) => {
					ArrowLeft($$renderer, { size: 14 });
					$$renderer.push(`<!----> `);

					Box($$renderer, {
						css: { ml: 5 },
						children: ($$renderer) => {
							$$renderer.push(`<!---->Back to the homepage`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}