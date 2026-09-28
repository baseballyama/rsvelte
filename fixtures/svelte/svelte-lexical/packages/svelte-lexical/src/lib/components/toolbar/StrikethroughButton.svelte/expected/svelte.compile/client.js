import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';
import { toggleStrikethrough } from '$lib/core/commands/commands.js';

var root = $.from_html(`<button type="button" aria-label="Format text with a strikethrough"><i class="format strikethrough"></i></button>`);

export default function StrikethroughButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isStrikethrough = () => $.store_get(isStrikethrough, '$isStrikethrough', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	const isStrikethrough = getContext('isStrikethrough');
	var button = root();

	$.template_effect(() => {
		button.disabled = !$isEditable();
		$.set_class(button, 1, 'toolbar-item spaced ' + ($isStrikethrough() ? 'active' : ''));
		$.set_attribute(button, 'title', `Strikethrough (${SHORTCUTS.STRIKETHROUGH})`);
	});

	$.delegated('click', button, () => {
		toggleStrikethrough($activeEditor());
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);