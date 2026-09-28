import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import themeOptions from 'virtual:sveltepress/theme-default';
import Edit from './icons/Edit.svelte';

var root = $.from_html(`<div class="edit-link svelte-1mhyhlv" role="link" tabindex="0"><div class="edit-icon svelte-1mhyhlv"><!></div> <div class="edit-text svelte-1mhyhlv"> </div></div>`);

export default function EditPage($$anchor, $$props) {
	$.push($$props, true);

	const routeId = page.route.id;

	/**
	 * @typedef {object} Props
	 * @property {'md' | 'svelte'} [pageType] - The type of the page
	 */
	/** @type {Props} */
	const pageType = $.prop($$props, 'pageType', 3, 'md');

	const DEFAULT_TEXT = 'Suggest changes to this page';

	function handleEditLinkClick() {
		if (themeOptions.editLink) {
			window.open(themeOptions.editLink.replace(':route', `${routeId}/+page.${pageType()}`), '_blank');
		}
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Edit(node, {});
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var text = $.only_child(div_2, true);

	$.reset(div);
	$.template_effect(() => $.set_text(text, themeOptions.i18n?.suggestChangesToThisPage || DEFAULT_TEXT));
	$.delegated('click', div, handleEditLinkClick);
	$.delegated('keyup', div, handleEditLinkClick);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keyup']);