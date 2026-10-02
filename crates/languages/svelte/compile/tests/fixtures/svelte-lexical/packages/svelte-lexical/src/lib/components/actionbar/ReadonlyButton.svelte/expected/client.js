import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getEditor, getIsEditable } from '$lib/core/composerContext.js';

var root = $.from_html(`<button type="button" title="Read-Only Mode"><i></i></button>`);

export default function ReadonlyButton($$anchor, $$props) {
	$.push($$props, true);

	const $isEditable = () => $.store_get(isEditable, '$isEditable', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const editor = getEditor();
	const isEditable = getIsEditable();
	var button = root();
	var i = $.only_child(button);

	$.template_effect(() => {
		$.set_class(button, 1, `action-button ${!$isEditable() ? 'unlock' : 'lock'}`);
		$.set_attribute(button, 'aria-label', `${!$isEditable() ? 'Unlock' : 'Lock'} read-only mode`);
		$.set_class(i, 1, $.clsx(!$isEditable() ? 'unlock' : 'lock'));
	});

	$.delegated('click', button, () => {
		editor.setEditable(!editor.isEditable());
	});

	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);