import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { condition } = $$props;

	if (condition) {
		$$renderer.push(`<!--[0--><p>foo</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>bar</p>`);
	}

	$$renderer.push(`<!--]-->`);
}