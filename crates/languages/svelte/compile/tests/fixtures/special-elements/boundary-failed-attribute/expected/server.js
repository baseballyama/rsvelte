import * as $ from 'svelte/internal/server';

export default function Boundary_failed_attribute($$renderer, $$props) {
	let { failed } = $$props;
	$$renderer.boundary({ failed }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);
		{
			$$renderer.push(`<p>Ready</p>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
