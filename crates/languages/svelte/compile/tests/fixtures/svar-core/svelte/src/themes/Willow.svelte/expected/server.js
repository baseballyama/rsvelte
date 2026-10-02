import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import FontOpenSans from "./FontOpenSans.svelte";

export default function Willow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { fonts = true, children } = $$props;

		setContext("wx-theme", "willow");

		$.head('2awslg', $$renderer, ($$renderer) => {
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
			$$renderer.push(`<!--[0--><div class="wx-theme wx-willow-theme" style="height:100%">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}