import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Composer, ContentEditable, ActionBar, RichTextPlugin } from '$lib/index.js';
import { theme as editorTheme } from '$lib/themes/system-light-dark/index.js';

import {
	$getRoot as getRoot,
	$createTextNode as createTextNode,
	$createParagraphNode as createParagraphNode
} from '$lib/index.js';

import Composer2Toolbar from './Composer2Toolbar.svelte';

var root_1 = $.from_html(`<div class="editor-shell svelte-lexical"><!> <div class="editor-container"><div class="editor-scroller"><div class="editor"><!></div></div> <!> <!></div></div>`);

export default function Composer2RichTextBasic($$anchor, $$props) {
	$.push($$props, true);

	const initialConfig = {
		theme: editorTheme,
		namespace: 'pg_sveltekit',
		nodes: [],
		onError: (error) => {
			throw error;
		},

		editorState: () => {
			const root = getRoot();

			if (root.getFirstChild() === null) {
				const paragraph = createParagraphNode();

				paragraph.append(createTextNode('This demo environment is built with '), createTextNode('svelte-lexical').toggleFormat('code'), createTextNode('.'), createTextNode(' Try typing in '), createTextNode('some text').toggleFormat('bold'), createTextNode(' with '), createTextNode('different').toggleFormat('italic'), createTextNode(' formats.'));
				root.append(paragraph);
			}
		}
	};

	Composer($$anchor, {
		get initialConfig() {
			return initialConfig;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			Composer2Toolbar(node, {});

			var div_1 = $.sibling(node, 2);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			ContentEditable(node_1, {});
			$.reset(div_3);
			$.reset(div_2);

			var node_2 = $.sibling(div_2, 2);

			RichTextPlugin(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ActionBar(node_3, {});
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}