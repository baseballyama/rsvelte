import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';
import { toggleUnderline } from '$lib/core/commands/commands.js';

var root = $.from_html(`<button type="button"><i class="format underline"></i></button>`);

export default function UnderlineButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isUnderline = () => $.store_get(isUnderline, '$isUnderline', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	const isUnderline = getContext('isUnderline');
	var button = root();

	$.template_effect(() => {
		button.disabled = !$isEditable();
		$.set_class(button, 1, 'toolbar-item spaced ' + ($isUnderline() ? 'active' : ''));
		$.set_attribute(button, 'title', `Underline (${SHORTCUTS.UNDERLINE})`);
		$.set_attribute(button, 'aria-label', `Format text to underlined. Shortcut: ${SHORTCUTS.UNDERLINE}`);
	});

	$.delegated('click', button, () => {
		toggleUnderline($activeEditor());
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);