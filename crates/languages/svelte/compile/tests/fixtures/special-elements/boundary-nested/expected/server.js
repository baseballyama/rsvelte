import * as $ from 'svelte/internal/server';

export default function Boundary_nested($$renderer) {
	$$renderer.push(`<p>Before</p>`);
	$$renderer.push(`<!--[-->`);
	{
		$$renderer.push(`<!--[-->`);
		{
			$$renderer.push(`<p>Ready</p>`);
		}
		$$renderer.push(`<!--]-->`);
	}
	$$renderer.push(`<!--]-->`);
	$$renderer.push(`<p>After</p>`);
}
