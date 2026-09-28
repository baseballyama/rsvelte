import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';
import { toggleUnderline } from '$lib/core/commands/commands.js';

export default function UnderlineButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		const isUnderline = getContext('isUnderline');

		$$renderer.push(`<button${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr_class('toolbar-item spaced ' + ($.store_get($$store_subs ??= {}, '$isUnderline', isUnderline) ? 'active' : ''))}${$.attr('title', `Underline (${SHORTCUTS.UNDERLINE})`)} type="button"${$.attr('aria-label', `Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`)}><i class="format underline"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}