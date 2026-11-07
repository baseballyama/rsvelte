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
	AutoLinkPlugin,
	CodeNode,
	CodeHighlightNode,
	CodeHighlightPrismPlugin,
	CodeActionMenuPlugin,
	ColumnLayoutPlugin,
	YouTubeNode,
	TweetNode
} from '$lib/index.js';

import {
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	HorizontalRuleNode,
	ImageNode,
	LayoutContainerNode,
	LayoutItemNode
} from '$lib/index.js';

import { theme } from '$lib/themes/system-light-dark/index.js';

import {
	$getRoot as getRoot,
	$createTextNode as createTextNode,
	$createParagraphNode as createParagraphNode
} from '$lib/index.js';

import RichTextToolbar from '../../RichTextToolbar.svelte';
import { onMount } from 'svelte';
import TablePlugin from '$lib/core/plugins/Table/TablePlugin.svelte';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import TableHoverActionPlugin from '$lib/core/plugins/Table/TableHoverActionPlugin.svelte';
import TableActionMenuPlugin from '$lib/core/plugins/Table/TableActionMenuPlugin.svelte';
import TableCellResizerPlugin from '$lib/core/plugins/Table/TableCellResizerPlugin.svelte';
import YoutubePlugin from '$lib/core/plugins/youtube/YoutubePlugin.svelte';
import TwitterPlugin from '$lib/core/plugins/twitter/TwitterPlugin.svelte';
import BlueskyPlugin from '$lib/core/plugins/bluesky/BlueskyPlugin.svelte';
import { BlueskyNode } from '$lib/core/plugins/bluesky/BlueskyNode.js';
import TabIndentationPlugin from '$lib/core/plugins/TabIndentationPlugin.svelte';

export default function RichTextComposer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { composer = void 0 } = $$props;
		let isSmallWidthViewport = true;
		let editorDiv = void 0;

		const initialConfig = {
			theme,
			namespace: 'pg_sveltekit',
			nodes: [
				HeadingNode,
				ListNode,
				ListItemNode,
				QuoteNode,
				HorizontalRuleNode,
				ImageNode,
				LinkNode,
				AutoLinkNode,
				CodeNode,
				CodeHighlightNode,
				LayoutContainerNode,
				LayoutItemNode,
				TableNode,
				TableCellNode,
				TableRowNode,
				YouTubeNode,
				TweetNode,
				BlueskyNode
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
				RichTextToolbar($$renderer, {});
				$$renderer.push(`<!----> <div class="editor-container tree-view"><div class="editor-scroller"><div class="editor">`);
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

				AutoLinkPlugin($$renderer, {
					attributes: { target: '_blank', rel: 'noopener noreferrer nofollow' }
				});

				$$renderer.push(`<!----> `);

				LinkPlugin($$renderer, {
					validateUrl,
					attributes: { target: '_blank', rel: 'noopener noreferrer nofollow' }
				});

				$$renderer.push(`<!----> `);
				CodeHighlightPrismPlugin($$renderer, {});
				$$renderer.push(`<!----> `);

				if (!isSmallWidthViewport) {
					$$renderer.push('<!--[0-->');
					FloatingLinkEditorPlugin($$renderer, { anchorElem: editorDiv });
					$$renderer.push(`<!----> `);
					CodeActionMenuPlugin($$renderer, { anchorElem: editorDiv });
					$$renderer.push(`<!---->`);
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
				ColumnLayoutPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TablePlugin($$renderer, { hasHorizontalScroll: true });
				$$renderer.push(`<!----> `);
				TableHoverActionPlugin($$renderer, { anchorElem: editorDiv });
				$$renderer.push(`<!----> `);
				TableCellResizerPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TableActionMenuPlugin($$renderer, { anchorElem: editorDiv, cellMerge: true });
				$$renderer.push(`<!----> `);
				YoutubePlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TwitterPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				BlueskyPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				TabIndentationPlugin($$renderer, {});
				$$renderer.push(`<!----> `);
				ActionBar($$renderer, {});
				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { composer });
	});
}