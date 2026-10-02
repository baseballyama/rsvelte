import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { decodeLabel } from '$lib/constants/categories';
import { DOC_PAGE_REGISTRY } from '$lib/components/docs/pages/demoRegistry';
import ComingSoon from '$lib/components/docs/pages/ComingSoon.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const sub = $.derived(() => page.params.subcategory ?? '');
		const niceName = $.derived(() => decodeLabel(sub()));
		let loadedSlug = '';
		let PageComponent = null;
		let loading = false;

		$.head('1pwaes', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(niceName())} - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<div class="category-page">`);

		if (PageComponent) {
			$$renderer.push('<!--[0-->');

			if (PageComponent) {
				$$renderer.push('<!--[-->');
				PageComponent($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (loading) {
			$$renderer.push(`<!--[1--><h1 class="sub-category">${$.escape(niceName())}</h1>`);
		} else {
			$$renderer.push(`<!--[-1--><h1 class="sub-category">${$.escape(niceName())}</h1> `);
			ComingSoon($$renderer, { name: niceName() });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}