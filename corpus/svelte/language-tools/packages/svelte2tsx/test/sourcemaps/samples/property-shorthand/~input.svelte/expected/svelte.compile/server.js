import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<button${$.attr('count', count)}>button</button>`);
}