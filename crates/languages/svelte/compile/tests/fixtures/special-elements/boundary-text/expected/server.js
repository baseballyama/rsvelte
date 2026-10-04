import * as $ from 'svelte/internal/server';

export default function Boundary_text($$renderer) {
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.push(`<!---->Hello`);
	}
	$$renderer.push(`<!--]-->`);
}
