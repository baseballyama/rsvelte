import * as $ from 'svelte/internal/server';

export default function _layout__app_($$renderer, $$props) {
	let { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}