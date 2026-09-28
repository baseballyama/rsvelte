import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	let { children, onclick } = $$props;

	$$renderer.push(`<button>`);
	children($$renderer);
	$$renderer.push(`<!----></button>`);
}