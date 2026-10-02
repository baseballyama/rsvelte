import * as $ from 'svelte/internal/server';

import {
	Composer,
	ContentEditable,
	ActionBar,
	PlainTextPlugin,
	HistoryPlugin
} from 'svelte-lexical';

import { theme as PlaygroundEditorTheme } from 'svelte-lexical/dist/themes/default';

export default function PlainTextComposer($$renderer) {
	const initialConfig = {
		theme: PlaygroundEditorTheme,
		namespace: 'Playground',
		nodes: [],
		onError: (error) => {
			throw error;
		}
	};

	Composer($$renderer, {
		initialConfig,
		children: ($$renderer) => {
			$$renderer.push(`<div class="editor-shell svelte-lexical"><div class="editor-container"><div class="editor-scroller"><div class="editor">`);
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