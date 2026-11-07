import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div class="a svelte-c0rrfb"></div> <!---->`);

	{
		$$renderer.push(`<div class="b svelte-c0rrfb"></div>`);
	}

	$$renderer.push(`<!----> <div class="c svelte-c0rrfb"></div>`);
}