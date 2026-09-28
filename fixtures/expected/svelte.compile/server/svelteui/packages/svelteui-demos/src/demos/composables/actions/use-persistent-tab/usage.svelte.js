import * as $ from 'svelte/internal/server';
import { Stack } from '@svelteuidev/core';
import { persistenttab } from '@svelteuidev/composables';

const code = `
<script>
    import { persistenttab } from '@svelteuidev/composables';

    let isNotClosable = false;
<\/script>

<button on:click={() => isNotClosable = !isNotClosable}>
    {isNotClosable ? "Can't close tab" : 'Can close tab'}
</button>

<div use:persistenttab={isNotClosable}>
    Something important that the user wouldn't want to lose to a page refresh or close
</div>`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer) {
	let isNotClosable = false;

	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<button>${$.escape(isNotClosable ? "Can't close tab" : 'Can close tab')}</button> <div>Something important that the user wouldn't want to lose to a page refresh or close</div>`);
		},
		$$slots: { default: true }
	});
}