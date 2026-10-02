import * as $ from 'svelte/internal/server';

export default function Code($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<code class="text-primary-700 dark:text-primary-700 text-sm font-semibold">`);
	children($$renderer);
	$$renderer.push(`<!----></code>`);
}