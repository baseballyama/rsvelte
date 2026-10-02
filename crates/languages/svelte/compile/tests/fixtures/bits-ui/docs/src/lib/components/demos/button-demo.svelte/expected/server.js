import * as $ from 'svelte/internal/server';
import { Button } from "bits-ui";

export default function Button_demo($$renderer) {
	if (Button.Root) {
		$$renderer.push('<!--[-->');

		Button.Root($$renderer, {
			class: 'rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex\n	h-12 items-center justify-center px-[21px] text-[15px]\n	font-semibold active:scale-[0.98] active:transition-all',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Unlimited`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}