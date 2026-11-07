import * as $ from 'svelte/internal/server';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

export default function No_parameters($$renderer) {
	// :::focus
	// :::highlight
	// :::
	// :::
	// :::focus
	// :::highlight
	let copied = '';

	function handleCopied(e) {
		copied = e.detail.text;
	}

	$$renderer.push(`<div class="not-prose grid grid-cols-[1fr_auto_1fr] items-center gap-2"><button class="c-btn" type="button"><strong>Click</strong> <span>to copy this</span></button> <p>-></p> <div class="hl-success grid place-items-center self-stretch">`);

	if (// :::
	// :::
	copied) {
		$$renderer.push(`<!--[0--><p>${$.escape(copied)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div></div>`);
}