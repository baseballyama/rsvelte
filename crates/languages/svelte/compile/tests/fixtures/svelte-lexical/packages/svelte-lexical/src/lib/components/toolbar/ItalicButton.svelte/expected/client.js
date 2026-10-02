import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { getContext } from 'svelte';
import { SHORTCUTS } from './shortcuts.js';
import { toggleItalic } from '$lib/core/commands/commands.js';

var root = $.from_html(`<button type="button"><i class="format italic"></i></button>`);

export default function ItalicButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isItalic = () => $.store_get(isItalic, '$isItalic', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	const isItalic = getContext('isItalic');
	var button = root();

	$.template_effect(() => {
		button.disabled = !$isEditable();
		$.set_class(button, 1, 'toolbar-item spaced ' + ($isItalic() ? 'active' : ''));
		$.set_attribute(button, 'title', `Italic (${SHORTCUTS.ITALIC})`);
		$.set_attribute(button, 'aria-label', `Format text as italics. Shortcut: ${SHORTCUTS.ITALIC}`);
	});

	$.delegated('click', button, () => {
		toggleItalic($activeEditor());
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);