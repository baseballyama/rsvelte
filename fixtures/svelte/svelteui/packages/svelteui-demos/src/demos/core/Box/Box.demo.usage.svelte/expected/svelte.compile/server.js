import * as $ from 'svelte/internal/server';
import { Box } from '@svelteuidev/core';

const code = `
<script>
	import { Box } from '@svelteuidev/core';
<\/script>

<Box
    css={{
        backgroundColor: '$gray50',
        textAlign: 'center',
        padding: '$20',
        borderRadius: '$md',
        cursor: 'pointer',

        '&:hover': {
            backgroundColor: '$gray100',
        },
    }}
>
    Box lets you add inline styles with the css prop
</Box>`;

export const type = 'demo';
export const configuration = { code };

export default function Box_demo_usage($$renderer) {
	Box($$renderer, {
		css: {
			backgroundColor: '$gray50',
			textAlign: 'center',
			padding: '$20',
			borderRadius: '$md',
			cursor: 'pointer',
			'&:hover': { backgroundColor: '$gray100' }
		},

		children: ($$renderer) => {
			$$renderer.push(`<!---->Box lets you add inline styles with the css prop`);
		},
		$$slots: { default: true }
	});
}