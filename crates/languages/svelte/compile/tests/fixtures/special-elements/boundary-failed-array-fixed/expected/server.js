import * as $ from 'svelte/internal/server';

export default function Boundary_failed_array_fixed($$renderer) {
	{
		function failed($$renderer, [first, , third], reset) {
			$$renderer.push(`<p>${$.escape(first)}: ${$.escape(third)}</p>`);
		}
		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);
			{
				$$renderer.push(`<p>Ready</p>`);
			}
			$$renderer.push(`<!--]-->`);
		});
	}
}
