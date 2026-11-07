import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { importFile } from '@lexical/file';
import { getEditor } from '$lib/core/composerContext.js';

var root = $.from_html(`<button type="button" class="action-button import" title="Import" aria-label="Import editor state from JSON"><i class="import"></i></button>`);

export default function ImportButton($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	var button = root();

	$.delegated('click', button, () => importFile(editor));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);