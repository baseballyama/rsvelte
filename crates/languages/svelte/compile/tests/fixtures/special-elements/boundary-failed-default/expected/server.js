import * as $ from 'svelte/internal/server';

export default function Boundary_failed_default($$renderer) {
	{
		function failed($$renderer, { message = "Unknown" }, reset) {
			$$renderer.push(`<p>${$.escape(message)}</p><button>Retry</button>`);
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
