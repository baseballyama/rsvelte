import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	let { foo } = $$props;

	foo($$renderer);
	$$renderer.push(`<!---->`);
}