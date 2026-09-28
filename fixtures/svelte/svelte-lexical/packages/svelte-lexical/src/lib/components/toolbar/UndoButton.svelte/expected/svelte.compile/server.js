import * as $ from 'svelte/internal/server';
import { CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL } from 'lexical';
import { onMount } from 'svelte';
import { getEditor, getIsEditable, getActiveEditor } from '$lib/core/composerContext.js';
import { IS_APPLE } from '@lexical/utils';
import { undo } from '$lib/core/commands/commands.js';

export default function UndoButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();
		const activeEditor = getActiveEditor();
		const isEditable = getIsEditable();
		let canUndo = false;

		// unregisters onDestroy through returned callback
		onMount(() => {
			return editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					canUndo = payload;

					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			);
		});

		$$renderer.push(`<button${$.attr('disabled', !canUndo || !$.store_get($$store_subs ??= {}, '$isEditable', isEditable), true)}${$.attr('title', IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)')} type="button" class="toolbar-item spaced" aria-label="Undo"><i class="format undo"></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}