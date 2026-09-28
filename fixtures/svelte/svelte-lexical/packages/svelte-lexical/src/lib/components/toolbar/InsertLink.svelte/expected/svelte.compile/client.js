import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { getActiveEditor, getIsEditable } from '$lib/core/composerContext.js';
import { SHORTCUTS } from './shortcuts.js';
import { InsertLink } from '$lib/core/commands/commands.js';

var root = $.from_html(`<button aria-label="Insert link" type="button"><i class="format link"></i></button>`);

export default function InsertLink_1($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const $activeEditor = () => $.store_get(activeEditor, '$activeEditor', $$stores);
	const $isLink = () => $.store_get(isLink, '$isLink', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const activeEditor = getActiveEditor();
	const isEditable = getIsEditable();
	const isLink = getContext('isLink');
	var button = root();

	$.template_effect(() => {
		button.disabled = !$isEditable();
		$.set_class(button, 1, 'toolbar-item spaced ' + ($isLink() ? 'active' : ''));
		$.set_attribute(button, 'title', `Insert link (${SHORTCUTS.INSERT_LINK})`);
	});

	$.delegated('click', button, () => InsertLink($activeEditor(), $isLink()));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);