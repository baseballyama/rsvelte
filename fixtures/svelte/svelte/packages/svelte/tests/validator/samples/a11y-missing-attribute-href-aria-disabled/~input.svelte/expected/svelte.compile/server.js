import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<a role="link" aria-disabled="true">Back</a>`);
}