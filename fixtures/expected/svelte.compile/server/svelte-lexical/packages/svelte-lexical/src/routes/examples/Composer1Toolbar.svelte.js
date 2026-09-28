import * as $ from 'svelte/internal/server';
import { Toolbar, UndoButton, RedoButton } from '$lib/index.js';

export default function Composer1Toolbar($$renderer) {
	{
		function children($$renderer, { editor, activeEditor, blockType }) {
			UndoButton($$renderer, {});
			$$renderer.push(`<!----> `);
			RedoButton($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		Toolbar($$renderer, { children, $$slots: { default: true } });
	}
}