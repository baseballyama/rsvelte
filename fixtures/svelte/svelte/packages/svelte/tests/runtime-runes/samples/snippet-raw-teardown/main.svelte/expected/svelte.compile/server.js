import * as $ from 'svelte/internal/server';
import { createRawSnippet } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = true;

		const snippet = createRawSnippet(() => ({
			render: () => `<hr>`,
			setup(p) {
				return () => console.log('tearing down');
			}
		}));

		$$renderer.push(`<button>click</button> `);

		if (show) {
			$$renderer.push('<!--[0-->');
			snippet($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}