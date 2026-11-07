import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Composer,
	ContentEditable,
	ActionBar,
	PlainTextPlugin,
	HistoryPlugin
} from '$lib/index.js';

import { theme as editorTheme } from '$lib/themes/system-light-dark/index.js';
import Composer1Toolbar from './Composer1Toolbar.svelte';

var root = $.from_html(`<div class="editor-shell svelte-lexical"><!> <div class="editor-container"><div class="editor-scroller"><div class="editor"><!></div></div> <!> <!> <!></div></div>`);

export default function Composer1PlainText($$anchor) {
	const initialConfig = {
		theme: editorTheme,
		namespace: 'Playground',
		nodes: [],
		onError: (error) => {
			throw error;
		}
	};

	Composer($$anchor, {
		get initialConfig() {
			return initialConfig;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Composer1Toolbar(node, {});

			var div_1 = $.sibling(node, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			ContentEditable(node_1, {});
			$.reset(div_3);
			$.reset(div_2);

			var node_2 = $.sibling(div_2, 2);

			PlainTextPlugin(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			HistoryPlugin(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ActionBar(node_4, {});
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}