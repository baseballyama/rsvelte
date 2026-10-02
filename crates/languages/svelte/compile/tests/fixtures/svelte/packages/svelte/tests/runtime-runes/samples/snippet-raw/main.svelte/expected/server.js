import * as $ from 'svelte/internal/server';
import { createRawSnippet } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		const hello = createRawSnippet((count) => ({
			render: () => `
			<p>clicks: ${count()}</p>
		`,
			setup(p) {}
		}));

		$$renderer.push(`<button>click</button> `);
		hello($$renderer, count);
		$$renderer.push(`<!---->`);
	});
}