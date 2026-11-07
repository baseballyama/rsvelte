import * as $ from 'svelte/internal/server';
import { Button, Center } from '@svelteuidev/core';
import { clipboard } from '@svelteuidev/composables';

const code = `
<script>
    import { Button } from '@svelteuidev/core';
	import { clipboard } from '@svelteuidev/composables';

    let textToCopy = 'This message was copied';
    let copied = false;
    let onCopy = () => {
        copied = true;
        setTimeout(function () {
            copied = false;
        }, 1000);
    }
<\/script>

<Button
    use={[[clipboard, textToCopy]]}
    on:useclipboard={onCopy}
    color={copied ? 'green' : 'blue'}
>
    {copied ? 'copied' : 'Click me to copy text'}
</Button>`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer) {
	let textToCopy = 'This message was copied';
	let copied = false;

	let onCopy = () => {
		copied = true;

		setTimeout(
			function () {
				copied = false;
			},
			1000
		);
	};

	Center($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				use: [[clipboard, textToCopy]],
				color: copied ? 'green' : 'blue',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(copied ? 'Copied' : 'Click me to copy text')}`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}