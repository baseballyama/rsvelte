import * as $ from 'svelte/internal/server';

export default function Boundary_pending_attribute($$renderer, $$props) {
	let { pending } = $$props;
	if (pending) {
		$$renderer.push(`<!--[!-->`);
		pending($$renderer);
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push(`<!--[-->`);
		{
			$$renderer.push(`<p>Ready</p>`);
		}
		$$renderer.push(`<!--]-->`);
	}
}
