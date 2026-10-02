import * as $ from 'svelte/internal/server';

export default function If_block($$renderer, $$props) {
	let { ok } = $$props;
	if (ok) {
		$$renderer.push(`<!--[0--><p>yes</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>no</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
