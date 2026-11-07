import * as $ from 'svelte/internal/server';

export default function Svelte_window_input($$renderer) {
	let key;
	let keyCode;

	function handleKeydown(event) {
		key = event.key;
		keyCode = event.keyCode;
	}

	$$renderer.push(`<div style="text-align: center" class="svelte-1h7qlrs">`);

	if (key) {
		$$renderer.push(`<!--[0--><kbd class="svelte-1h7qlrs">${$.escape(key === ' ' ? 'Space' : key)}</kbd> <p>${$.escape(keyCode)}</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>Focus this window and press any key</p>`);
	}

	$$renderer.push(`<!--]--></div>`);
}