import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import FontOpenSans from "./FontOpenSans.svelte";

export default function WillowDark($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { fonts = true, children } = $$props;

		setContext("wx-theme", "willow-dark");

		$.head('1uge87s', $$renderer, ($$renderer) => {
			if (fonts) {
				$$renderer.push(`<!--[0--><link rel="preconnect" href="https://cdn.svar.dev" crossorigin=""/> `);
				FontOpenSans($$renderer, {});
				$$renderer.push(`<!----> <link rel="stylesheet" href="https://cdn.svar.dev/fonts/wxi/wx-icons.css"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		if (children) {
			$$renderer.push(`<!--[0--><div class="wx-theme wx-willow-dark-theme" style="height:100%">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}