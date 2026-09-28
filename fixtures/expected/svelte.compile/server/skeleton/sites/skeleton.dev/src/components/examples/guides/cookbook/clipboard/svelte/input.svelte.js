import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let value = 'Hello Skeleton';

	async function handleCopy() {
		await navigator.clipboard.writeText(value);
		alert(`Copied "${value}" to clipboard!`);
	}

	$$renderer.push(`<div class="flex items-center gap-4"><input type="text" class="input"${$.attr('value', value)}/> <button class="btn preset-filled">Copy</button></div>`);
}