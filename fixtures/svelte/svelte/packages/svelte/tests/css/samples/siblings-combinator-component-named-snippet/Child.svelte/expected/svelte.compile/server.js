import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { foo } = $$props;

	foo($$renderer);
	$$renderer.push(`<!---->`);
}