import * as $ from 'svelte/internal/server';
import { AspectRatio } from "bits-ui";

export default function Aspect_ratio_demo($$renderer) {
	if (AspectRatio.Root) {
		$$renderer.push('<!--[-->');

		AspectRatio.Root($$renderer, {
			ratio: 14 / 9,
			class: 'rounded-15px scale-[0.8] bg-transparent',
			children: ($$renderer) => {
				$$renderer.push(`<img src="/abstract.png" alt="an abstract painting" class="h-full w-full rounded-[15px] object-cover"/>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}