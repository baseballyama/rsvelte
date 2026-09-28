import * as $ from 'svelte/internal/server';

export default function Default($$renderer) {
	async function handleCopy() {
		const data = 'Hello World!';

		await navigator.clipboard.writeText(data);
		alert(`Copied "${data}" to clipboard!`);
	}

	$$renderer.push(`<button class="btn preset-filled">Copy to Clipboard</button>`);
}