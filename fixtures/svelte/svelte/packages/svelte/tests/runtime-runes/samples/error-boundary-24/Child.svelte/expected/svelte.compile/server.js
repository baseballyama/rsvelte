import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		throw new Error('child error');

		$$renderer.push(`<p>Child content</p>`);
	});
}