import * as $ from 'svelte/internal/server';

export default function Stack($$renderer, $$props) {
	const { children } = $$props;

	$$renderer.push(`<div class="stack svelte-12rq7fr">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}