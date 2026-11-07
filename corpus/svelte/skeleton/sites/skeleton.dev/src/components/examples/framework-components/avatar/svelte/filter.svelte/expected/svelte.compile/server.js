import * as $ from 'svelte/internal/server';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

export default function Filter($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			if (Avatar.Image) {
				$$renderer.push('<!--[-->');

				Avatar.Image($$renderer, {
					src: 'https://i.pravatar.cc/150?img=48',
					class: 'filter-[url(#apollo)]',
					alt: 'filtered'
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

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

	$$renderer.push(`<!----><svg class="absolute -left-full w-0 h-0"><filter id="apollo" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix values="0.8 0.6 -0.4 0.1 0,
    0 1.2 0.05 0 0,
    0 -1 3 0.02 0,
    0 0 0 50 0" result="final" in="SourceGraphic"></feColorMatrix></filter></svg>`);
}