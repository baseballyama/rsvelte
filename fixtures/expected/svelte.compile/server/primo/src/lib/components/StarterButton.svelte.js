import * as $ from 'svelte/internal/server';
import SitePreview from '$lib/components/SitePreview.svelte';
import { CheckCircle } from 'lucide-svelte';

export default function StarterButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * @typedef {Object} Props
		 * @property {import('$lib').Site} site
		 * @property {boolean} selected
		 * @property {any} [preview]
		 * @property {string} [append]
		 * @property {string} [style]
		 * @property {any} [src]
		 * @property {MouseEventHandler<HTMLButtonElement> } [onclick]
		 */
		/** @type {Props} */
		let {
			site,
			selected,
			preview = null,
			append = '',
			style = '',
			src = null,
			onclick
		} = $$props;

		$$renderer.push(`<button class="relative overflow-hidden rounded w-full" type="button">`);

		if (selected) {
			$$renderer.push(`<!--[0--><div class="absolute inset-0 z-20 bg-black/50 flex items-center justify-center">`);
			CheckCircle($$renderer, { size: 32, class: 'text-white' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		SitePreview($$renderer, { preview, append });
		$$renderer.push(`<!----> <div class="absolute bottom-0 w-full px-3 py-2 z-30 bg-gray-900 bg-opacity-50 backdrop-blur-xs text-left"><span class="text-sm font-medium leading-none">${$.escape(site.name)}</span></div></button>`);
		$.bind_props($$props, { preview });
	});
}