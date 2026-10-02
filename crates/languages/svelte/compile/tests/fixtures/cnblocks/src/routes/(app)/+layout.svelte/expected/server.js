import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import Header from "$lib/web/layouts/Header.svelte";
import SiteFooter from "$lib/web/layouts/SiteFooter.svelte";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		// If Path include v2-docs, then don't shwo site footer
		let showHeaderFooter = $.derived(() => {
			let path = page.url.pathname;

			return !path.includes("v2-docs");
		});

		Header($$renderer, {});
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!----> `);

		if (showHeaderFooter()) {
			$$renderer.push('<!--[0-->');
			SiteFooter($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}