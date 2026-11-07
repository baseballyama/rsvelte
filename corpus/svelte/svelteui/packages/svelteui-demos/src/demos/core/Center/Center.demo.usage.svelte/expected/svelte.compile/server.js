import * as $ from 'svelte/internal/server';
import { Center, Box } from '@svelteuidev/core';

const code = `
    <script>
        import { Center } from '@svelteuidev/core';
    <\/script>

    <Center>
        All elements inside Center are centered
    </Center>
	`;

export const type = 'demo';
export const configuration = { code };

export default function Center_demo_usage($$renderer) {
	Center($$renderer, {
		override: { maxW: 400, height: 200, bc: '$blue50', m: 'auto', p: '$5' },
		children: ($$renderer) => {
			Box($$renderer, {
				css: { bc: '$blue200' },
				children: ($$renderer) => {
					$$renderer.push(`<!---->All elements inside Center are centered`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}