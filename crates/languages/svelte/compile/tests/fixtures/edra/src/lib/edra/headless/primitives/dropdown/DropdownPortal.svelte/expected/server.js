import * as $ from 'svelte/internal/server';

export default function DropdownPortal($$renderer, $$props) {
	let { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}