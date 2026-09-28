import * as $ from 'svelte/internal/server';
import cjs from 'e2e-test-dep-layout-svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-ignore
		cjs.cjs();

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--> <p>this layout uses a new dependency</p>`);
	});
}