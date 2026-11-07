import * as $ from 'svelte/internal/server';

export default function Page_grid($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="overflow-hidden"><div class="-m-px grid grid-cols-12 *:px-1 *:py-12 sm:*:px-8 xl:*:px-12 [&amp;_>*:not(:first-child)]:-ms-px [&amp;_>*:not(:first-child)]:-mt-px">`);
	children($$renderer);
	$$renderer.push(`<!----></div></div>`);
}