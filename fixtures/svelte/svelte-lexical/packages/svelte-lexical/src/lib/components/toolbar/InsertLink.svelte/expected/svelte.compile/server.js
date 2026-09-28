import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';
import { InsertLink } from '$lib/core/commands/commands.js';

export default function InsertLink_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		const isLink = getContext('isLink');

		$$renderer.push(`<button${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr_class('toolbar-item spaced ' + ($.store_get($$store_subs ??= {}, '$isLink', isLink) ? 'active' : ''))} aria-label="Insert link"${$.attr('title', `Insert link (${SHORTCUTS.INSERT_LINK})`)} type="button"><i class="format link"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}