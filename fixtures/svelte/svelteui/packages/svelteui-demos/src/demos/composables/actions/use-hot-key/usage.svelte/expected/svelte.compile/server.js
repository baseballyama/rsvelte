import * as $ from 'svelte/internal/server';
import { Center, Text } from '@svelteuidev/core';
import { hotkey } from '@svelteuidev/composables';

const code = `
<script>
    import { hotkey } from '@svelteuidev/composables';

    function onSubmit() {
        alert("You've used a hotkey");
    }
<\/script>

<p>Press ⌘+Enter or Ctrl+Enter to trigger an alert</p>
<div use:hotkey={[['mod+Enter', () => onSubmit()]]}/>`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer) {
	function onSubmit() {
		alert("You've used a hotkey");
	}

	Center($$renderer, {
		children: ($$renderer) => {
			Text($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Press ⌘+Enter or Ctrl+Enter to trigger an alert`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div></div>`);
		},
		$$slots: { default: true }
	});
}