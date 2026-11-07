import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	$$renderer.push(`<p>child</p>`);
}