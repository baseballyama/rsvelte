import * as $ from 'svelte/internal/server';

export default function Docs_figure($$renderer, $$props) {
	let { children, caption } = $$props;

	$$renderer.push(`<figure class="mt-6 flex flex-col gap-4">`);
	children?.($$renderer);
	$$renderer.push(`<!----> <figcaption class="text-center text-sm text-gray-500">${$.escape(caption)}</figcaption></figure>`);
}