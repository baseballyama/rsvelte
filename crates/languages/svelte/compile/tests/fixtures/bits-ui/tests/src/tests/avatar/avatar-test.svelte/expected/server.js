import * as $ from 'svelte/internal/server';
import { Avatar } from "bits-ui";

export default function Avatar_test($$renderer, $$props) {
	let { src } = $$props;

	$$renderer.push(`<main>`);

	if (Avatar.Root) {
		$$renderer.push('<!--[-->');

		Avatar.Root($$renderer, {
			'data-testid': 'root',
			children: ($$renderer) => {
				if (Avatar.Image) {
					$$renderer.push('<!--[-->');
					Avatar.Image($$renderer, { src, alt: 'huntabyte', 'data-testid': 'image' });
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
							$$renderer.push(`<!---->HJ`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button data-testid="clear-button">clear src</button></main>`);
}