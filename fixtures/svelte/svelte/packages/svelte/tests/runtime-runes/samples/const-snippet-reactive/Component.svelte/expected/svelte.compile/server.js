import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { test } = $$props;

	test?.($$renderer);
	$$renderer.push(`<!---->`);
}