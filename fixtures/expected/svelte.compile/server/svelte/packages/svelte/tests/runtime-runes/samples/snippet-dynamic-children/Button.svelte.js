import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	const { children, change } = $$props;

	$$renderer.push(`<button>`);
	children($$renderer);
	$$renderer.push(`<!----></button>`);
}