import * as $ from 'svelte/internal/server';

export default function Boundary_pending_count($$renderer) {
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.push(`<p>Pending: ${$.escape(0)}</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
