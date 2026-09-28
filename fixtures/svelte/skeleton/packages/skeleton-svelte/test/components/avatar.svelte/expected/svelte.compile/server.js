import * as $ from 'svelte/internal/server';
import { Avatar } from '../../src/index.js';

export default function Avatar_1($$renderer) {
	Avatar($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (Avatar.Image) {
				$$renderer.push('<!--[-->');
				Avatar.Image($$renderer, { 'data-testid': 'image', src: 'https://picsum.photos/100/100' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Avatar.Fallback) {
				$$renderer.push('<!--[-->');

				Avatar.Fallback($$renderer, {
					'data-testid': 'fallback',
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