import * as $ from 'svelte/internal/server';

export default function Boundary_static($$renderer) {
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.push(`<p>Hello</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
