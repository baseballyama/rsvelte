import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1j96wlh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(page.status)}: ${$.escape(page.error?.message)}</title>`);
			});
		});

		$$renderer.push(`<div class="flex h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4"><h3 class="text-svelte scroll-m-20 text-2xl font-semibold tracking-tight">${$.escape(page.status)}</h3> <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">${$.escape(page.error?.message)}</h1></div>`);
	});
}