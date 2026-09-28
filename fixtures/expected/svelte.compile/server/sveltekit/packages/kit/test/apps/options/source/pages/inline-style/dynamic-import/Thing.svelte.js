import * as $ from 'svelte/internal/server';

export default function Thing($$renderer) {
	$$renderer.push(`<p class="svelte-1wbzr5">I'm dynamically imported</p>`);
}