import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	let file;

	onMount(() => {
		file = new Blob([JSON.stringify({ hello: 'world' })], { type: 'application/json' });
	});

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [[download, { blob: file, filename: 'hello.txt' }]]);

				Button($$anchor, {
					variant: 'outline',
					get use() {
						return $.get($0);
					},
					$$events: { usedownload: () => console.log('File Downloaded') },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Download File');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.pop();
}