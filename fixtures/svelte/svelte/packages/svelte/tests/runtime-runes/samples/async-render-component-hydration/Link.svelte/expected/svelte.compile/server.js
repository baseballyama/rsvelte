import * as $ from 'svelte/internal/server';

export default function Link($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<a href="/">`);
	children($$renderer);
	$$renderer.push(`<!----></a>`);
}