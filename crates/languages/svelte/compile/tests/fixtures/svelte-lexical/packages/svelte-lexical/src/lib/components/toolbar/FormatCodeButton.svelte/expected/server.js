import * as $ from 'svelte/internal/server';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';

export default function FormatCodeButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const isEditable = getIsEditable();
		const activeEditor = getActiveEditor();
		const isCode = getContext('isCode');

		$$renderer.push(`<button${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr_class('toolbar-item spaced ' + ($.store_get($$store_subs ??= {}, '$isCode', isCode) ? 'active' : ''))}${$.attr('title', `Insert code block (${SHORTCUTS.CODE_BLOCK})`)} type="button" aria-label="Insert code block"><i class="format code"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}