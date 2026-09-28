import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Button, Center } from '@svelteuidev/core';
import { download } from '@svelteuidev/composables';

const code = `
<script>
    import { onMount } from 'svelte';
    import { Button } from '@svelteuidev/core';
    import { download } from '@svelteuidev/composables';

    let file;
    onMount(() => {
        file = new Blob([JSON.stringify({ hello: 'world' })], { type: 'application/json' })
    });
<\/script>

<Button 
    variant='outline'
    use={[[download, { blob: file, filename: "test.txt" }]]}
    on:usedownload={() => console.log('File Downloaded')}
>
    Download File
</Button>`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let file;

		onMount(() => {
			file = new Blob([JSON.stringify({ hello: 'world' })], { type: 'application/json' });
		});

		Center($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					variant: 'outline',
					use: [[download, { blob: file, filename: 'hello.txt' }]],
					children: ($$renderer) => {
						$$renderer.push(`<!---->Download File`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}