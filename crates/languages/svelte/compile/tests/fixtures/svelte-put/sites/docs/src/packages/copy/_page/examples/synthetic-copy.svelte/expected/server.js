import * as $ from 'svelte/internal/server';
import { copy } from '@svelte-put/copy';
import { fade } from 'svelte/transition';

export default function Synthetic_copy($$renderer) {
	let copied = '';

	function onSyntheticCopy(e) {
		const clipboardData = e.clipboardData;

		copied = clipboardData?.getData('text/plain') ?? '';

		// clipboardData.setData will have no effect here
	}

	$$renderer.push(`<div class="not-prose grid grid-cols-[1fr_auto_1fr] items-center gap-2"><button class="c-btn" type="button"><strong>Click</strong> <span>synthetic copy</span></button> <p>-></p> <div class="hl-success grid place-items-center self-stretch">`);

	if (copied) {
		$$renderer.push(`<!--[0--><p>${$.escape(copied)}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div></div>`);
}