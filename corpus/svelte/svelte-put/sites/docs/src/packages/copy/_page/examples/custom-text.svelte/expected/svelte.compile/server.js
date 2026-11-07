import * as $ from 'svelte/internal/server';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

export default function Custom_text($$renderer) {
	let copied = '';

	// :::focus
	// :::highlight
	function copyText(input) {
		const { node } = input;

		copied = `Custom - ${node.innerText}`;

		return copied;
	}

	$$renderer.push(`<div class="not-prose grid grid-cols-[1fr_auto_1fr] items-center gap-2"><button class="c-btn" type="button">Click</button>  <p>-></p> <div class="hl-success grid place-items-center self-stretch">`);

	if (// :::
	// :::
	copied) {
		$$renderer.push(`<!--[0--><p>${$.escape(copied)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div></div>`);
}