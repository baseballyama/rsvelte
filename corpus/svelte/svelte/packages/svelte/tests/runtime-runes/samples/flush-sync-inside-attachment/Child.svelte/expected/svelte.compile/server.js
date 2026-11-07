import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { text } = $$props;

		$$renderer.push(`<!---->${$.escape(text)}`);
	});
}