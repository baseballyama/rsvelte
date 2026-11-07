import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Composer,
	ContentEditable,
	ActionBar,
	PlainTextPlugin,
	HistoryPlugin
} from 'svelte-lexical';

import { theme as PlaygroundEditorTheme } from 'svelte-lexical/dist/themes/default';

var root = $.from_html(`<div class="editor-shell svelte-lexical"><div class="editor-container"><div class="editor-scroller"><div class="editor"><!></div></div> <!> <!> <!></div></div>`);

export default function PlainTextComposer($$anchor) {
	const initialConfig = {
		theme: PlaygroundEditorTheme,
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
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node = $.child(div_3);

			ContentEditable(node, {});
			$.reset(div_3);
			$.reset(div_2);

			var node_1 = $.sibling(div_2, 2);

			PlainTextPlugin(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			HistoryPlugin(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ActionBar(node_3, {});
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}