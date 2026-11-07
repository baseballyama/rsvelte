import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function Overlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { overlay } = $$props;
		const api = getContext("grid-store");

		function isComponent(prop) {
			return typeof prop === "function";
		}

		$$renderer.push(`<div class="wx-overlay svelte-abcd2c">`);

		if (isComponent(overlay)) {
			$$renderer.push('<!--[0-->');

			const SvelteComponent = overlay;

			if (SvelteComponent) {
				$$renderer.push('<!--[-->');
				SvelteComponent($$renderer, { onaction: ({ action, data }) => api.exec(action, data) });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(overlay)}`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}