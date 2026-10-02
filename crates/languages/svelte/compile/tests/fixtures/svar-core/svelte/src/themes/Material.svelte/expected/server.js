import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import RobotoFont from "./FonttRoboto.svelte";

export default function Material($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { fonts = true, children } = $$props;

		setContext("wx-theme", "material");

		$.head('18cl9nb', $$renderer, ($$renderer) => {
			if (fonts) {
				$$renderer.push(`<!--[0--><link rel="preconnect" href="https://cdn.svar.dev" crossorigin=""/> `);
				RobotoFont($$renderer, {});
				$$renderer.push(`<!----> <link rel="stylesheet" href="https://cdn.svar.dev/fonts/wxi/wx-icons.css"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		if (children) {
			$$renderer.push(`<!--[0--><div class="wx-material-theme" style="height:100%">`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}