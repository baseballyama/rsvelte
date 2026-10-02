import * as $ from 'svelte/internal/server';

export default function H2($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<h2 class="text-3xl leading-tight font-extrabold text-gray-900 lg:text-4xl dark:text-white">`);
	children?.($$renderer);
	$$renderer.push(`<!----></h2>`);
}