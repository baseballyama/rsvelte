import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div>`);
	$$renderer.push(`<!--[-->`);

	{
		$$renderer.push(`<div>test</div>`);
	}

	$$renderer.push(`<!--]-->`);
	$$renderer.push(`</div>`);
}