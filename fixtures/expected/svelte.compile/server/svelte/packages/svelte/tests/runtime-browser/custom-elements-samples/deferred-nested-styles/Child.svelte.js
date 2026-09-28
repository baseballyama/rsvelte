import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	$$renderer.push(`<p class="svelte-1rn8yxv">child</p>`);
}