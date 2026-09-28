import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Composer,
	ContentEditable,
	ToolbarRichText,
	ActionBar,
	RichTextPlugin,
	HistoryPlugin,
	ListPlugin,
	CheckListPlugin,
	HorizontalRulePlugin,
	ImagePlugin
} from 'svelte-lexical';

import {
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	HorizontalRuleNode,
	ImageNode
} from 'svelte-lexical';

import { theme } from 'svelte-lexical/dist/themes/default';

import {
	$getRoot as getRoot,
	$createTextNode as createTextNode,
	$createParagraphNode as createParagraphNode
} from 'svelte-lexical';

var root_1 = $.from_html(`<div class="editor-shell svelte-lexical"><!> <div class="editor-container"><div class="editor-scroller"><div class="editor"><!></div></div> <!> <!> <!> <!> <!> <!> <!></div></div>`);

export default function RichTextComposer($$anchor, $$props) {
	$.push($$props, true);

	const initialConfig = {
		theme,
		nodes: [
			HeadingNode,
			ListNode,
			ListItemNode,
			QuoteNode,
			HorizontalRuleNode,
			ImageNode
		],

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

			ToolbarRichText(node, {});

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

			HistoryPlugin(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ListPlugin(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			CheckListPlugin(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			HorizontalRulePlugin(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			ImagePlugin(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			ActionBar(node_8, {});
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}