import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Target($$anchor, $$props) {
	$.push($$props, true);

	let value = 'I am using a hotkey to submit';

	function onSubmit(val) {
		alert(`Your message says: ${val}`);
	}

	var event_handler = $.derived(() => getHotkeyHandler([['mod+Enter', () => onSubmit(value)]]));

	TextInput($$anchor, {
		placeholder: 'Your message',
		label: 'Press ⌘+Enter or Ctrl+Enter when input has focus to send message',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		$$events: {
			keydown: function (...$$args) {
				$.get(event_handler)?.apply(this, $$args);
			}
		}
	});

	$.pop();
}