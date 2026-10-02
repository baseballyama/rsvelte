import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';

var root = $.from_html(`<button type="button" aria-label="Insert code block"><i class="format code"></i></button>`);

export default function FormatCodeButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isCode = () => $.store_get(isCode, '$isCode', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const isEditable = getIsEditable();
	const activeEditor = getActiveEditor();
	const isCode = getContext('isCode');
	var button = root();

	$.template_effect(() => {
		button.disabled = !$isEditable();
		$.set_class(button, 1, 'toolbar-item spaced ' + ($isCode() ? 'active' : ''));
		$.set_attribute(button, 'title', `Insert code block (${SHORTCUTS.CODE_BLOCK})`);
	});

	$.delegated('click', button, () => {
		$activeEditor().dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);