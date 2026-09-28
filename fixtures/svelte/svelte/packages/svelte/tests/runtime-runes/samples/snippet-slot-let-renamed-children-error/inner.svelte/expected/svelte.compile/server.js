import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	let { children: x } = $$props;

	x($$renderer, true);
	$$renderer.push(`<!---->`);
}