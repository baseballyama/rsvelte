import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const url = import.meta.url;

		$$renderer.push(`<!---->${$.escape(url)}
${$.escape(import.meta.url)}`);
	});
}