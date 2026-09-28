import * as $ from 'svelte/internal/server';
import { getActiveEditor, getBold, getIsEditable } from '$lib/core/composerContext.js';
import { toggleBold } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from './shortcuts.js';

export default function BoldButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		const isBold = getBold();

		$$renderer.push(`<button${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr_class('toolbar-item spaced ' + ($.store_get($$store_subs ??= {}, '$isBold', isBold) ? 'active' : ''))}${$.attr('title', `Bold (${SHORTCUTS.BOLD})`)} type="button"${$.attr('aria-label', `Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`)}><i class="format bold"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}