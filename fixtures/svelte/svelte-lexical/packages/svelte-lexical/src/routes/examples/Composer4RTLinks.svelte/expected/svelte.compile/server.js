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
	MarkdownShortcutPlugin,
	TEXT_FORMAT_TRANSFORMERS,
	ELEMENT_TRANSFORMERS,
	HR,
	IMAGE,
	CHECK_LIST,
	LinkNode,
	LinkPlugin,
	validateUrl,
	CAN_USE_DOM,
	FloatingLinkEditorPlugin,
	LINK,
	AutoLinkNode,
	AutoLinkPlugin
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

import { onMount } from 'svelte';
import Composer4Toolbar from './Composer4Toolbar.svelte';

export default function Composer4RTLinks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let isSmallWidthViewport = true;
		let editorDiv = void 0;

		const initialConfig = {
			theme: editorTheme,
			namespace: 'pg_sveltekit',
			nodes: [
				HeadingNode,
				ListNode,
				ListItemNode,
				QuoteNode,
				HorizontalRuleNode,
				ImageNode,
				LinkNode,
				AutoLinkNode
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

		onMount(() => {
			function updateViewPortWidth() {
				const isNextSmallWidthViewport = CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;

				if (isNextSmallWidthViewport !== isSmallWidthViewport) {
					isSmallWidthViewport = isNextSmallWidthViewport;
				}
			}

			updateViewPortWidth();
			window.addEventListener('resize', updateViewPortWidth);

			return () => {
				window.removeEventListener('resize', updateViewPortWidth);
			};
		});

		Composer($$renderer, {
			initialConfig,
			children: ($$renderer) => {
				$$renderer.push(`<div class="editor-shell svelte-lexical">`);
				Composer4Toolbar($$renderer, {});
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
				AutoLinkPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				LinkPlugin($$renderer, { validateUrl });
				$$renderer.push(`<!----> `);

				if (!isSmallWidthViewport) {
					$$renderer.push('<!--[0-->');
					FloatingLinkEditorPlugin($$renderer, { anchorElem: editorDiv });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				MarkdownShortcutPlugin($$renderer, {
					transformers: [
						...TEXT_FORMAT_TRANSFORMERS,
						...ELEMENT_TRANSFORMERS,
						HR,
						IMAGE,
						CHECK_LIST,
						LINK
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