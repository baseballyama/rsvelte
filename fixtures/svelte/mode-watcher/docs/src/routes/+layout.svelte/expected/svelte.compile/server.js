import * as $ from 'svelte/internal/server';
import { siteConfig } from "$lib/site-config";
import "../app.css";
import { useSiteConfig } from "@svecodocs/kit";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;

		useSiteConfig(() => siteConfig);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}