import * as $ from 'svelte/internal/server';

export default function Boundary_failed_rest($$renderer) {
	{
		function failed($$renderer, { message, ...rest }, reset) {
			$$renderer.push(`<p>${$.escape(message)}: ${$.escape(rest.name)}</p>`);
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
