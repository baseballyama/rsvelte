import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CAN_REDO_COMMAND, COMMAND_PRIORITY_CRITICAL } from 'lexical';
import { onMount } from 'svelte';
import { getEditor, getIsEditable, getActiveEditor } from '$lib/core/composerContext.js';
import { IS_APPLE } from '@lexical/utils';
import { redo } from '$lib/core/commands/commands.js';

var root = $.from_html(`<button type="button" class="toolbar-item" aria-label="Redo"><i class="format redo"></i></button>`);

export default function RedoButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	let canRedo = $.state(false);

	// unregisters onDestroy through returned callback
	onMount(() => {
		return editor.registerCommand(
			CAN_REDO_COMMAND,
			(payload) => {
				$.set(canRedo, payload, true);

				return false;
			},
			COMMAND_PRIORITY_CRITICAL
		);
	});

	var button = root();

	$.template_effect(() => {
		button.disabled = !$.get(canRedo) || !$isEditable();
		$.set_attribute(button, 'title', IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)');
	});

	$.delegated('click', button, () => {
		redo($activeEditor());
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);