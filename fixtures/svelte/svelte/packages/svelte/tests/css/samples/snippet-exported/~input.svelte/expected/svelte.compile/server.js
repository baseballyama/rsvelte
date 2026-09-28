import * as $ from 'svelte/internal/server';

function outer($$renderer) {
	$$renderer.push(`<p class="inner svelte-19s05cs"></p>`);
}

export { outer };

export default function Input($$renderer) {}