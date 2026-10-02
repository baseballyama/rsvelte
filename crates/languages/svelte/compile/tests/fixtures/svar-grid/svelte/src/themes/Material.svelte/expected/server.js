import * as $ from 'svelte/internal/server';
import { Material } from "@svar-ui/svelte-core";

export default function Material_1($$renderer, $$props) {
	let { fonts = true, children } = $$props;

	if (children) {
		$$renderer.push('<!--[0-->');

		Material($$renderer, {
			fonts,
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
		Material($$renderer, { fonts });
	}

	$$renderer.push(`<!--]-->`);
}