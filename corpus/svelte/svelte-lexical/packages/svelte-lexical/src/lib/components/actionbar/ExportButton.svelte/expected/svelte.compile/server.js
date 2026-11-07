import * as $ from 'svelte/internal/server';
import { exportFile } from '@lexical/file';
import { getEditor } from '$lib/core/composerContext.js';

export default function ExportButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();

		$$renderer.push(`<button type="button" class="action-button export" title="Export" aria-label="Export editor state to JSON"><i class="export"></i></button>`);
	});
}