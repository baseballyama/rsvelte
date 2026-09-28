import * as $ from 'svelte/internal/server';

export default function Component($$renderer) {
	$$renderer.push(`<p id="conditionally" class="svelte-1f61riy">This is conditionally rendered</p>`);
}