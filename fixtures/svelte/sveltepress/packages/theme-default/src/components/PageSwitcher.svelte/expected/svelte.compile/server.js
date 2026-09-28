import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import themOptions from 'virtual:sveltepress/theme-default';
import Next from './icons/Next.svelte';
import Prev from './icons/Prev.svelte';
import { pages } from './layout';
import { getPathFromBase, isLinkActive } from './utils';

export default function PageSwitcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const routeId = page.route.id;
		const activeIdx = $.derived(() => $.store_get($$store_subs ??= {}, '$pages', pages).findIndex((p) => isLinkActive(p.to, routeId)));
		const hasActivePage = $.derived(() => activeIdx() !== -1);
		const hasPrevPage = $.derived(() => hasActivePage() && activeIdx() > 0);
		const hasNextPage = $.derived(() => hasActivePage() && activeIdx() < $.store_get($$store_subs ??= {}, '$pages', pages).length - 1);
		const DEFAULT_PREVIOUS_TEXT = 'Previous';
		const DEFAULT_NEXT_TEXT = 'Next';

		$$renderer.push(`<div class="page-switcher svelte-r8xjx0"><div${$.attr_class('svelte-r8xjx0', void 0, { 'switcher': hasPrevPage() })}>`);

		if (hasPrevPage()) {
			$$renderer.push('<!--[0-->');

			const prevPage = $.store_get($$store_subs ??= {}, '$pages', pages)[activeIdx() - 1];

			$$renderer.push(`<a${$.attr('href', getPathFromBase(prevPage.to))} class="trigger svelte-r8xjx0"><div class="hint svelte-r8xjx0">${$.escape(themOptions.i18n?.previousPage || DEFAULT_PREVIOUS_TEXT)}</div> <div class="title svelte-r8xjx0"><div class="switch-icon svelte-r8xjx0">`);
			Prev($$renderer, {});
			$$renderer.push(`<!----></div> <div class="title-label svelte-r8xjx0">${$.escape(prevPage.title)}</div></div></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div${$.attr_class('right svelte-r8xjx0', void 0, { 'switcher': hasNextPage() })}>`);

		if (hasNextPage()) {
			$$renderer.push('<!--[0-->');

			const nextPage = $.store_get($$store_subs ??= {}, '$pages', pages)[activeIdx() + 1];

			$$renderer.push(`<a${$.attr('href', getPathFromBase(nextPage.to))} class="trigger svelte-r8xjx0"><div class="hint svelte-r8xjx0">${$.escape(themOptions.i18n?.nextPage || DEFAULT_NEXT_TEXT)}</div> <div class="title svelte-r8xjx0"><div class="title-label svelte-r8xjx0">${$.escape(nextPage.title)}</div> <div class="switch-icon svelte-r8xjx0">`);
			Next($$renderer, {});
			$$renderer.push(`<!----></div></div></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}