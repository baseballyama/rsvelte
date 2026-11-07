import * as $ from 'svelte/internal/server';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			if (Avatar.Image) {
				$$renderer.push('<!--[-->');
				Avatar.Image($$renderer, { src: 'https://picsum.photos/100/100' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Avatar.Fallback) {
				$$renderer.push('<!--[-->');

				Avatar.Fallback($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->SK`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}