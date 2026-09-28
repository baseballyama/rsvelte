import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';
import { toggleStrikethrough } from '$lib/core/commands/commands.js';

export default function StrikethroughButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		const isStrikethrough = getContext('isStrikethrough');

		$$renderer.push(`<button${$.attr('disabled', !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr_class('toolbar-item spaced ' + ($.store_get($$store_subs ??= {}, '$isStrikethrough', isStrikethrough) ? 'active' : ''))}${$.attr('title', `Strikethrough (${SHORTCUTS.STRIKETHROUGH})`)} type="button" aria-label="Format text with a strikethrough"><i class="format strikethrough"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}