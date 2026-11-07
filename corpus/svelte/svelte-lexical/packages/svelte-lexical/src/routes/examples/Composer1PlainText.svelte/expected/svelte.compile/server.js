import * as $ from 'svelte/internal/server';

import {
	Composer,
	ContentEditable,
	ActionBar,
	PlainTextPlugin,
	HistoryPlugin
} from '$lib/index.js';

import { theme as editorTheme } from '$lib/themes/system-light-dark/index.js';
import Composer1Toolbar from './Composer1Toolbar.svelte';

export default function Composer1PlainText($$renderer) {
	const initialConfig = {
		theme: editorTheme,
		namespace: 'Playground',
		nodes: [],
		onError: (error) => {
			throw error;
		}
	};

	Composer($$renderer, {
		initialConfig,
		children: ($$renderer) => {
			$$renderer.push(`<div class="editor-shell svelte-lexical">`);
			Composer1Toolbar($$renderer, {});
			$$renderer.push(`<!----> <div class="editor-container"><div class="editor-scroller"><div class="editor">`);
			ContentEditable($$renderer, {});
			$$renderer.push(`<!----></div></div> `);
			PlainTextPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			HistoryPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			ActionBar($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}