import * as $ from 'svelte/internal/server';
import cjs from 'e2e-test-dep-error';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// @ts-ignore
		cjs.cjs();

		$$renderer.push(`<!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--> <p>this error page uses a new dependency</p>`);
	});
}