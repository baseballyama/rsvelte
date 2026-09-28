import * as $ from 'svelte/internal/server';
import "../app.css";
import { siteConfig } from "$lib/config/site";
import { useSiteConfig } from "@svecodocs/kit";
import { dev } from "$app/environment";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		useSiteConfig(() => siteConfig);

		$.head('12evr8a', $$renderer, ($$renderer) => {
			if (!dev) {
				$$renderer.push(`<!--[0--><script defer="" data-domain="runed.dev" src="https://server.hj.run/js/script.js"></script>`);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}