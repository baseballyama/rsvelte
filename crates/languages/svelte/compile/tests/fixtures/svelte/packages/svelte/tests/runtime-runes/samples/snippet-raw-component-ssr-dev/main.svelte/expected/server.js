import * as $ from 'svelte/internal/server';
import { createRawSnippet, hydrate } from 'svelte';
import { render } from 'svelte/server';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { browser } = $$props;
		let count = 0;

		const hello = createRawSnippet((count) => ({
			render: () => `
			<div>${browser ? '' : render(Child).body}</div>
		`,

			setup(target) {
				hydrate(Child, { target });
			}
		}));

		$$renderer.push(`<div>`);
		hello($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}