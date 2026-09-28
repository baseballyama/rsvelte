import * as $ from 'svelte/internal/server';
import { CAN_REDO_COMMAND, COMMAND_PRIORITY_CRITICAL } from 'lexical';
import { onMount } from 'svelte';
import { getEditor, getIsEditable, getActiveEditor } from '$lib/core/composerContext.js';
import { IS_APPLE } from '@lexical/utils';
import { redo } from '$lib/core/commands/commands.js';

export default function RedoButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		let canRedo = false;

		// unregisters onDestroy through returned callback
		onMount(() => {
			return editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
					canRedo = payload;

					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			);
		});

		$$renderer.push(`<button${$.attr('disabled', !canRedo || !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr('title', IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)')} type="button" class="toolbar-item" aria-label="Redo"><i class="format redo"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}