import * as $ from 'svelte/internal/server';
import cjs from 'e2e-test-dep-page-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-ignore
		cjs.cjs();

		$$renderer.push(`<p>this page uses a new dependency</p>`);
	});
}