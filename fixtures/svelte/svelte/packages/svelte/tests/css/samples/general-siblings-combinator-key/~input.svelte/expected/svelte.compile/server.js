import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div class="a svelte-1y4h2no"></div> <!---->`);

	{
		$$renderer.push(`<div class="b svelte-1y4h2no"></div>`);
	}

	$$renderer.push(`<!----> <div class="c svelte-1y4h2no"></div>`);
}