import * as $ from 'svelte/internal/server';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

export default function Fallback($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
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