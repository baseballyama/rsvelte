import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { exportFile } from '@lexical/file';
import { getEditor } from '$lib/core/composerContext.js';

var root = $.from_html(`<button type="button" class="action-button export" title="Export" aria-label="Export editor state to JSON"><i class="export"></i></button>`);

export default function ExportButton($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	var button = root();

	$.delegated('click', button, () => exportFile(editor, {
		fileName: `Playground ${new Date().toISOString()}`,
		source: 'Playground'
	}));

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);