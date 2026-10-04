import * as $ from 'svelte/internal/server';

export default function Boundary_pending_snippet($$renderer) {
	$$renderer.push(`<!--[!-->`);
	{
		$$renderer.push(`<p>Loading</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
