import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (("Eva").startsWith('E')) {
			$$renderer.push(`<!--[0-->eee`);
		} else {
			$$renderer.push(`<!--[-1-->rrr`);
		}

		$$renderer.push(`<!--]-->`);
	});
}