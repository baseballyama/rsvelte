import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function Logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Store brand mark: the uploaded store logo when present, otherwise the store name as a
		 * text wordmark — the same fallback the header uses. `variant="light"` renders white
		 * text for dark backgrounds (the editorial footer recolors .text-white to ink itself).
		 */
		let { href = '/', variant = 'default', class: className = '' } = $$props;

		const store = $.derived(() => page?.data?.store);
		const name = $.derived(() => store()?.name || 'Svelte Commerce');

		$$renderer.push(`<a${$.attr('href', href)}${$.attr_class(`inline-flex items-center leading-none ${$.stringify(className)}`)}${$.attr('aria-label', `${$.stringify(name())} — home`)}>`);

		if (store()?.logo) {
			$$renderer.push(`<!--[0--><img${$.attr('src', store().logo)}${$.attr('alt', name())} class="h-9 w-auto max-w-[200px] object-contain"/>`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attr_class(`font-serif text-[1.5rem] font-bold tracking-[0.02em] ${variant === 'light' ? 'text-white' : 'text-foreground'}`)}>${$.escape(name())}</span>`);
		}

		$$renderer.push(`<!--]--></a>`);
	});
}