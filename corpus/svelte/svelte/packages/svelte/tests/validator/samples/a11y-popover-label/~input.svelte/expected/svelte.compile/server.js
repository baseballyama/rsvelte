import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<button interestfor="my-hint"><div id="my-hint" popover="hint">hello</div></button>`);
}