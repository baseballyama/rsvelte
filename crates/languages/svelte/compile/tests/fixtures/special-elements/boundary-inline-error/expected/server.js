import * as $ from 'svelte/internal/server';

export default function Boundary_inline_error($$renderer) {
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.push(`<!---->...`);
	}
	$$renderer.push(`<!--]-->`);
}
