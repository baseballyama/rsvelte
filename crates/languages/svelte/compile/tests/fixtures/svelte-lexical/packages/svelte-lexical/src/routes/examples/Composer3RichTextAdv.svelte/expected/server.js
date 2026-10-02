import * as $ from 'svelte/internal/server';

import {
	Composer,
	ContentEditable,
	ActionBar,
	RichTextPlugin,
	HistoryPlugin,
	ListPlugin,
	CheckListPlugin,
	HorizontalRulePlugin,
	ImagePlugin,
	TEXT_FORMAT_TRANSFORMERS,
	ELEMENT_TRANSFORMERS,
	HR,
	IMAGE,
	CHECK_LIST
} from '$lib/index.js';

import {
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	HorizontalRuleNode,
	ImageNode
} from '$lib/index.js';

import { theme as editorTheme } from '$lib/themes/system-light-dark/index.js';

import {
	$getRoot as getRoot,
	$createTextNode as createTextNode,
	$createParagraphNode as createParagraphNode
} from '$lib/index.js';

import MarkdownShortcutPlugin from '$lib/core/plugins/MarkdownShortcut/MarkdownShortcutPlugin.svelte';
import Composer3Toolbar from './Composer3Toolbar.svelte';

export default function Composer3RichTextAdv($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const initialConfig = {
			theme: editorTheme,
			namespace: 'pg_sveltekit',
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
				Composer3Toolbar($$renderer, {});
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
				ImagePlugin($$renderer, { captionsEnabled: false });
				$$renderer.push(`<!----> `);

				MarkdownShortcutPlugin($$renderer, {
					transformers: [
						...TEXT_FORMAT_TRANSFORMERS,
						...ELEMENT_TRANSFORMERS,
						HR,
						IMAGE,
						CHECK_LIST
					]
				});

				$$renderer.push(`<!----> `);
				ActionBar($$renderer, {});
				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}