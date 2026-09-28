import * as $ from 'svelte/internal/server';
import { page } from "$app/stores";
import { googleTag } from "./analytics.js";

export default function Analytics($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;

		$.head('1ig02kh', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="preconnect" crossorigin="anonymous" href="https://www.googletagmanager.com/gtag/js?id=G-8TYYNBE4EE"/>`);
		});

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}