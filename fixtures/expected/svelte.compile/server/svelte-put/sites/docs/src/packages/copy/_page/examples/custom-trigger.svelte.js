import * as $ from 'svelte/internal/server';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

export default function Custom_trigger($$renderer) {
	let trigger = undefined;
	let copied = '';

	function handleCopied(e) {
		copied = e.detail.text;
	}

	$$renderer.push(`<div class="not-prose grid grid-cols-[0.5fr_auto_0.5fr_auto_1fr] items-center gap-4"><button class="c-btn" type="button">Click</button> <p>to</p> <div class="grid place-items-center border border-yellow-500 p-2"><p>copy this</p></div>  <p>-></p> <div class="hl-success grid place-items-center self-stretch">`);

	if (copied) {
		$$renderer.push(`<!--[0--><p>${$.escape(copied)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div></div>`);
}