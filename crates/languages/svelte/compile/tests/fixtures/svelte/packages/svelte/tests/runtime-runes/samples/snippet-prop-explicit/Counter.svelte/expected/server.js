import * as $ from 'svelte/internal/server';

export default function Counter($$renderer, $$props) {
	let { foo } = $$props;
	let count = 0;

	foo($$renderer, count);
	$$renderer.push(`<!----> <button>click me</button>`);
}