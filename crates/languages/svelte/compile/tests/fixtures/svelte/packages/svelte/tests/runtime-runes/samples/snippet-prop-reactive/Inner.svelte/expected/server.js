import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	let { snippet } = $$props;

	snippet($$renderer);
	$$renderer.push(`<!---->`);
}