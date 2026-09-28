import * as $ from 'svelte/internal/server';
import { Box, Button, Stack } from '@svelteuidev/core';
import { portal } from '@svelteuidev/composables';

const code = `
<script>
    import { Box, Button } from '@svelteuidev/core';
    import { portal } from '@svelteuidev/composables';

    let magic = false;
<\/script>

{#if magic}
    <div>
        Look at the top of the page
    </div>
{/if}
<div>
    <Box 
        use={[[portal, magic ? 'h1' : null]]}
        css={{bc: 'white', border: '1px solid black', br: '$md', padding: '$md'}} 
    >
        I'm being rendered {magic ? 'outside' : 'inside'} of the preview
    </Box>
</div>
<Button on:click={() => magic = !magic}>Click me to see the magic</Button>`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer) {
	let magic = false;

	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			if (magic) {
				$$renderer.push(`<!--[0--><div>Look at the top of the page</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div>`);

			Box($$renderer, {
				use: [[portal, magic ? 'h1' : null]],
				css: {
					bc: 'white',
					border: '1px solid black',
					br: '$md',
					padding: '$md'
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->I'm being rendered ${$.escape(magic ? 'outside' : 'inside')} of the preview`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Click me to see the magic`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}