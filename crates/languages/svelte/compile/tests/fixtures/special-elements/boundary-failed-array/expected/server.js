import * as $ from 'svelte/internal/server';

export default function Boundary_failed_array($$renderer) {
	{
		function failed($$renderer, [first, ...rest], reset) {
			$$renderer.push(`<p>${$.escape(first)}: ${$.escape(rest.length)}</p>`);
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
