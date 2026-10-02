import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Input($$renderer) {
	$$renderer.push(`<div>`);

	Test($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { t }) => {
				$$renderer.push(`<!---->xx`);
			}
		}
	});

	$$renderer.push(`<!----></div>`);
}