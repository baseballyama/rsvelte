import * as $ from 'svelte/internal/server';

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

export default function RichTextComposer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Composer($$renderer, {
			initialConfig,
			children: ($$renderer) => {
				$$renderer.push(`<div class="editor-shell svelte-lexical">`);
				ToolbarRichText($$renderer, {});
				$$renderer.push(`<!----> <div class="editor-container"><div class="editor-scroller"><div class="editor">`);
				ContentEditable($$renderer, {});
				$$renderer.push(`<!----></div></div> `);
				RichTextPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				HistoryPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ListPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				CheckListPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				HorizontalRulePlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ImagePlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ActionBar($$renderer, {});
				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}