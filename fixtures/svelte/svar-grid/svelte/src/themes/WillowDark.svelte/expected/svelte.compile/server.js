import * as $ from 'svelte/internal/server';
import { WillowDark } from "@svar-ui/svelte-core";

export default function WillowDark_1($$renderer, $$props) {
	let { fonts = true, children } = $$props;

	if (children) {
		$$renderer.push('<!--[0-->');

		WillowDark($$renderer, {
			fonts,
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
		WillowDark($$renderer, { fonts });
	}

	$$renderer.push(`<!--]-->`);
}