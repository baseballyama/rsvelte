import * as $ from 'svelte/internal/server';

export default function Boundary_failed_snippet($$renderer) {
	{
		function failed($$renderer, error, reset) {
			$$renderer.push(`<p>${$.escape(error.message)}</p><button>Retry</button>`);
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
