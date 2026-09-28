import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Usage($$anchor) {
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

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [[clipboard, textToCopy]]);
				let $1 = $.derived(() => copied ? 'green' : 'blue');

				Button($$anchor, {
					get use() {
						return $.get($0);
					},

					get color() {
						return $.get($1);
					},
					$$events: { useclipboard: onCopy },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, copied ? 'Copied' : 'Click me to copy text'));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});
}