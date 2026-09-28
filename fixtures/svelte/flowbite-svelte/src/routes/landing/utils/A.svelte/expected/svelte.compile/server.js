import * as $ from 'svelte/internal/server';

export default function A($$renderer, $$props) {
	let { children = undefined, href } = $$props;

	$$renderer.push(`<a${$.attr('href', href)} class="text-lg font-medium text-gray-900 underline hover:no-underline dark:text-white">`);
	children?.($$renderer);
	$$renderer.push(`<!----></a>`);
}