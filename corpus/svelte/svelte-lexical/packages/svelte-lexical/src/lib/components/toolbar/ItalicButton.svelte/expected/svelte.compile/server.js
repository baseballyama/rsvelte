import * as $ from 'svelte/internal/server';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from './shortcuts.js';
import { toggleItalic } from '$lib/core/commands/commands.js';

export default function ItalicButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		const isItalic = getContext('isItalic');

		$$renderer.push(`<button${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr_class('toolbar-item spaced ' + ($.store_get($$store_subs ??= {}, '$isItalic', isItalic) ? 'active' : ''))}${$.attr('title', `Italic (${SHORTCUTS.ITALIC})`)} type="button"${$.attr('aria-label', `Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`)}><i class="format italic"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}