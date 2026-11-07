import * as $ from 'svelte/internal/server';

export default function PageLayout($$renderer, $$props) {
	// Intentionally minimal — content is slotted in from +page.svelte
	const { children } = $$props;

	$$renderer.push(`<div class="sp-blog-page svelte-lpr308">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}