import * as $ from 'svelte/internal/server';

export default function Boundary_failed_object($$renderer) {
	{
		function failed($$renderer, { message }, reset) {
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
