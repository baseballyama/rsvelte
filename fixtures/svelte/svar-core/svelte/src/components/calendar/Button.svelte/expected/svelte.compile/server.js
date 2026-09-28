import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	let { onclick, children } = $$props;

	$$renderer.push(`<button class="svelte-11un7qt">`);
	children?.($$renderer);
	$$renderer.push(`<!----></button>`);
}