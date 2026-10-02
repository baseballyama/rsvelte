import * as $ from 'svelte/internal/server';
import { TextInput } from '@svelteuidev/core';
import { getHotkeyHandler } from '@svelteuidev/composables';

const code = `
<script lang="ts">
	import { TextInput } from '@svelteuidev/core';
	import { getHotkeyHandler } from '@svelteuidev/composables';

	let value = 'I am using a hotkey to submit';

	function onSubmit(val) {
		alert(\`Your message says: $\{val\}\`);
	}
<\/script>

<TextInput
	placeholder="Your message"
	label="Press ⌘+Enter or Ctrl+Enter when input has focus to send message"
	bind:value
	on:keydown={getHotkeyHandler([['mod+Enter', () => onSubmit(value)]])}
/>
`;

export const type = 'demo';
export const configuration = { code };

export default function Target($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 'I am using a hotkey to submit';

		function onSubmit(val) {
			alert(`Your message says: ${val}`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			TextInput($$renderer, {
				placeholder: 'Your message',
				label: 'Press ⌘+Enter or Ctrl+Enter when input has focus to send message',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}