import * as $ from 'svelte/internal/server';
import { createRawSnippet } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const snippet = createRawSnippet(() => ({
			render: () => `
			<!-- --><div>123</div>
		`
		}));

		snippet($$renderer);
	});
}