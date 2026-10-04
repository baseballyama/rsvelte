import * as $ from 'svelte/internal/server';

export default function Boundary_failed_whole_default($$renderer) {
	{
		function failed($$renderer, { message } = { message: "Unknown" }, reset) {
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
