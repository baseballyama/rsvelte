import * as $ from 'svelte/internal/server';

export default function Test($$renderer, $$props) {
	let { foo } = $$props;

	$$renderer.push(`<!---->${$.escape(foo)}`);
}