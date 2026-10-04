import * as $ from 'svelte/internal/server';

export default function Boundary_attrs($$renderer) {
	function onerror(error, reset) {
		console.log(error);
	}
	function failed() {}
	$$renderer.boundary({ failed }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);
		{
			$$renderer.push(`<p>Hello</p>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
