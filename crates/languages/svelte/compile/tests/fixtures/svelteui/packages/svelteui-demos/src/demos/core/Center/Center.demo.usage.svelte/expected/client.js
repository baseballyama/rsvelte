import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Center_demo_usage($$anchor) {
	Center($$anchor, {
		override: { maxW: 400, height: 200, bc: '$blue50', m: 'auto', p: '$5' },
		children: ($$anchor, $$slotProps) => {
			Box($$anchor, {
				css: { bc: '$blue200' },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('All elements inside Center are centered');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}