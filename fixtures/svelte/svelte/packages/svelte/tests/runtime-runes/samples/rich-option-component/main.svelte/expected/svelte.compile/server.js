import * as $ from 'svelte/internal/server';
import Content from './Content.svelte';

export default function Main($$renderer) {
	let content = 'b';

	$$renderer.push(`<select>`);

	$$renderer.option(
		{ value: 'x' },
		($$renderer) => {
			$$renderer.push(`<span>${$.escape(content)}</span>`);
			Content($$renderer, { text: content });
			$$renderer.push(`<!---->`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(`</select> <button>Toggle Content</button>`);
}