import * as $ from 'svelte/internal/server';

export default function Boundary_failed_nested($$renderer) {
	{
		function failed($$renderer, { cause: { message } }, reset) {
			$$renderer.push(`<p>${$.escape(message)}</p>`);
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
