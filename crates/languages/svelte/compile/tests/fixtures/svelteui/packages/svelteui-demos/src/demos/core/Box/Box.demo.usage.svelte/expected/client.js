import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Box_demo_usage($$anchor) {
	Box($$anchor, {
		css: {
			backgroundColor: '$gray50',
			textAlign: 'center',
			padding: '$20',
			borderRadius: '$md',
			cursor: 'pointer',
			'&:hover': { backgroundColor: '$gray100' }
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Box lets you add inline styles with the css prop');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});
}