import * as $ from 'svelte/internal/server';
import { Avatar } from "bits-ui";

export default function Avatar_demo($$renderer) {
	if (Avatar.Root) {
		$$renderer.push('<!--[-->');

		Avatar.Root($$renderer, {
			delayMs: 200,
			class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border text-[17px] font-medium uppercase data-[status=loading]:border-transparent',
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent">`);

				if (Avatar.Image) {
					$$renderer.push('<!--[-->');
					Avatar.Image($$renderer, { src: '/avatar-1.png', alt: '@huntabyte' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Avatar.Fallback) {
					$$renderer.push('<!--[-->');

					Avatar.Fallback($$renderer, {
						class: 'border-muted border',
						children: ($$renderer) => {
							$$renderer.push(`<!---->HB`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}