import * as $ from 'svelte/internal/server';
import { Willow } from "@svar-ui/svelte-core";

export default function Willow_1($$renderer, $$props) {
	let { fonts = true, children } = $$props;

	if (children) {
		$$renderer.push('<!--[0-->');

		Willow($$renderer, {
			fonts,
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
		Willow($$renderer, { fonts });
	}

	$$renderer.push(`<!--]-->`);
}