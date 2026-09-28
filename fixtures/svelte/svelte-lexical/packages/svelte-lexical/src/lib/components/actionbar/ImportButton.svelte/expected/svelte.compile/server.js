import * as $ from 'svelte/internal/server';
import { importFile } from '@lexical/file';
import { getEditor } from '$lib/core/composerContext.js';

export default function ImportButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		$$renderer.push(`<button type="button" class="action-button import" title="Import" aria-label="Import editor state from JSON"><i class="import"></i></button>`);
	});
}