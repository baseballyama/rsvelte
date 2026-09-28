import * as $ from 'svelte/internal/server';
import { Label } from "bits-ui";

export default function Label_test($$renderer) {
	$$renderer.push(`<main>`);

	if (Label.Root) {
		$$renderer.push('<!--[-->');

		Label.Root($$renderer, {
			for: 'input',
			'data-testid': 'label',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Label`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <input type="text" id="input" data-testid="input"/></main>`);
}