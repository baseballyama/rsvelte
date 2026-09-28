import * as $ from 'svelte/internal/server';
import { getEditor, getIsEditable } from '$lib/core/composerContext.js';

export default function ReadonlyButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const editor = getEditor();
		const isEditable = getIsEditable();

		$$renderer.push(`<button type="button"${$.attr_class(`action-button ${!$.store_get($$store_subs ??= {}, '$isEditable', isEditable) ? 'unlock' : 'lock'}`)} title="Read-Only Mode"${$.attr('aria-label', `${!$.store_get($$store_subs ??= {}, '$isEditable', isEditable) ? 'Unlock' : 'Lock'} read-only mode`)}><i${$.attr_class($.clsx(!$.store_get($$store_subs ??= {}, '$isEditable', isEditable) ? 'unlock' : 'lock'))}></i></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}