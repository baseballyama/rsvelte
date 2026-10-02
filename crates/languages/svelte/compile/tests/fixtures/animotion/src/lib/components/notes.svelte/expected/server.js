import * as $ from 'svelte/internal/server';

export default function Notes($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<aside class="notes">`);
	children($$renderer);
	$$renderer.push(`<!----></aside>`);
}