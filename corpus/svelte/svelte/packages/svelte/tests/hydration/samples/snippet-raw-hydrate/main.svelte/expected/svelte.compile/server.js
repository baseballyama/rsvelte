import * as $ from 'svelte/internal/server';
import { createRawSnippet } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const snippet = createRawSnippet(() => ({
			render: () => `
			<p>rendered</p>
		`,

			setup(p) {
				p.textContent = 'hydrated';
			}
		}));

		snippet($$renderer);
	});
}