import * as $ from 'svelte/internal/server';

export default function Boundary_failed_default_call($$renderer) {
	function fallback() {
		return "Unknown";
	}
	{
		function failed($$renderer, { message = fallback() }, reset) {
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
