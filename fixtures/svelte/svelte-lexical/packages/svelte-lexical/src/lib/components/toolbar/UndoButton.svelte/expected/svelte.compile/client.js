import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CAN_UNDO_COMMAND, COMMAND_PRIORITY_CRITICAL } from 'lexical';
import { onMount } from 'svelte';
import { getEditor, getIsEditable, getActiveEditor } from '$lib/core/composerContext.js';
import { IS_APPLE } from '@lexical/utils';
import { undo } from '$lib/core/commands/commands.js';

var root = $.from_html(`<button type="button" class="toolbar-item spaced" aria-label="Undo"><i class="format undo"></i></button>`);

export default function UndoButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	let canUndo = $.state(false);

	// unregisters onDestroy through returned callback
	onMount(() => {
		return editor.registerCommand(
			CAN_UNDO_COMMAND,
			(payload) => {
				$.set(canUndo, payload, true);

				return false;
			},
			COMMAND_PRIORITY_CRITICAL
		);
	});

	var button = root();

	$.template_effect(() => {
		button.disabled = !$.get(canUndo) || !$isEditable();
		$.set_attribute(button, 'title', IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)');
	});

	$.delegated('click', button, () => {
		undo($activeEditor());
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);