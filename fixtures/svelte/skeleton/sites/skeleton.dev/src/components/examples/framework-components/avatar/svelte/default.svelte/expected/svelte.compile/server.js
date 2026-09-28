import * as $ from 'svelte/internal/server';
import { Avatar } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	$$renderer.push(`<div class="flex items-center gap-8">`);

	Avatar($$renderer, {
		class: 'size-10',
		children: ($$renderer) => {
			if (Avatar.Image) {
				$$renderer.push('<!--[-->');
				Avatar.Image($$renderer, { src: 'https://i.pravatar.cc/40?img=48', alt: 'small' });
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

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		children: ($$renderer) => {
			if (Avatar.Image) {
				$$renderer.push('<!--[-->');
				Avatar.Image($$renderer, { src: 'https://i.pravatar.cc/60?img=48', alt: 'base' });
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

	$$renderer.push(`<!----> `);

	Avatar($$renderer, {
		class: 'size-20',
		children: ($$renderer) => {
			if (Avatar.Image) {
				$$renderer.push('<!--[-->');
				Avatar.Image($$renderer, { src: 'https://i.pravatar.cc/80?img=48', alt: 'large' });
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

	$$renderer.push(`<!----></div>`);
}