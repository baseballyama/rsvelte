import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getActiveEditor, getBold, getIsEditable } from '$lib/core/composerContext.js';
import { toggleBold } from '$lib/core/commands/commands.js';
import { SHORTCUTS } from './shortcuts.js';

var root = $.from_html(`<button type="button"><i class="format bold"></i></button>`);

export default function BoldButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isBold = () => $.store_get(isBold, '$isBold', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	const isBold = getBold();
	var button = root();

	$.template_effect(() => {
		button.disabled = !$isEditable();
		$.set_class(button, 1, 'toolbar-item spaced ' + ($isBold() ? 'active' : ''));
		$.set_attribute(button, 'title', `Bold (${SHORTCUTS.BOLD})`);
		$.set_attribute(button, 'aria-label', `Format text as bold. Shortcut: ${SHORTCUTS.BOLD}`);
	});

	$.delegated('click', button, () => toggleBold($activeEditor()));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);