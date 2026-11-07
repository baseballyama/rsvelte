import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import themeOptions from 'virtual:sveltepress/theme-default';
import Edit from './icons/Edit.svelte';

export default function EditPage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const routeId = page.route.id;

		/**
		 * @typedef {object} Props
		 * @property {'md' | 'svelte'} [pageType] - The type of the page
		 */
		/** @type {Props} */
		const { pageType = 'md' } = $$props;

		const DEFAULT_TEXT = 'Suggest changes to this page';

		function handleEditLinkClick() {
			if (themeOptions.editLink) {
				window.open(themeOptions.editLink.replace(':route', `${routeId}/+page.${pageType}`), '_blank');
			}
		}

		$$renderer.push(`<div class="edit-link svelte-1mhyhlv" role="link" tabindex="0"><div class="edit-icon svelte-1mhyhlv">`);
		Edit($$renderer, {});
		$$renderer.push(`<!----></div> <div class="edit-text svelte-1mhyhlv">${$.escape(themeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT)}</div></div>`);
	});
}