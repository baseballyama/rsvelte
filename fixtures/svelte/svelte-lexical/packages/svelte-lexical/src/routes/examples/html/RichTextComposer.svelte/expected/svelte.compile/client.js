import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="editor-shell svelte-lexical"><!> <div class="editor-container tree-view"><div class="editor-scroller"><div class="editor"><!></div></div> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div>`);

export default function RichTextComposer($$anchor, $$props) {
	$.push($$props, true);

	let composer = $.prop($$props, 'composer', 15);
	let isSmallWidthViewport = $.state(true);
	let editorDiv = $.state(void 0);

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

			if (isNextSmallWidthViewport !== $.get(isSmallWidthViewport)) {
				$.set(isSmallWidthViewport, isNextSmallWidthViewport, true);
			}
		}

		updateViewPortWidth();
		window.addEventListener('resize', updateViewPortWidth);

		return () => {
			window.removeEventListener('resize', updateViewPortWidth);
		};
	});

	$.bind_this(
		Composer($$anchor, {
			get initialConfig() {
				return initialConfig;
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_2();
				var node = $.child(div);

				RichTextToolbar(node, {});

				var div_1 = $.sibling(node, 2);
				var div_2 = $.child(div_1);
				var div_3 = $.child(div_2);
				var node_1 = $.child(div_3);

				ContentEditable(node_1, {});
				$.reset(div_3);
				$.bind_this(div_3, ($$value) => $.set(editorDiv, $$value), () => $.get(editorDiv));
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

				ImagePlugin(node_7, { captionsEnabled: false });

				var node_8 = $.sibling(node_7, 2);

				AutoLinkPlugin(node_8, {
					attributes: { target: '_blank', rel: 'noopener noreferrer nofollow' }
				});

				var node_9 = $.sibling(node_8, 2);

				LinkPlugin(node_9, {
					get validateUrl() {
						return validateUrl;
					},
					attributes: { target: '_blank', rel: 'noopener noreferrer nofollow' }
				});

				var node_10 = $.sibling(node_9, 2);

				CodeHighlightPrismPlugin(node_10, {});

				var node_11 = $.sibling(node_10, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_1 = root_1();
						var node_12 = $.first_child(fragment_1);

						FloatingLinkEditorPlugin(node_12, {
							get anchorElem() {
								return $.get(editorDiv);
							}
						});

						var node_13 = $.sibling(node_12, 2);

						CodeActionMenuPlugin(node_13, {
							get anchorElem() {
								return $.get(editorDiv);
							}
						});

						$.append($$anchor, fragment_1);
					};

					$.if(node_11, ($$render) => {
						if (!$.get(isSmallWidthViewport)) $$render(consequent);
					});
				}

				var node_14 = $.sibling(node_11, 2);

				{
					let $0 = $.derived(() => [
						...TEXT_FORMAT_TRANSFORMERS,
						...ELEMENT_TRANSFORMERS,
						HR,
						IMAGE,
						CHECK_LIST,
						LINK
					]);

					MarkdownShortcutPlugin(node_14, {
						get transformers() {
							return $.get($0);
						}
					});
				}

				var node_15 = $.sibling(node_14, 2);

				ColumnLayoutPlugin(node_15, {});

				var node_16 = $.sibling(node_15, 2);

				TablePlugin(node_16, { hasHorizontalScroll: true });

				var node_17 = $.sibling(node_16, 2);

				TableHoverActionPlugin(node_17, {
					get anchorElem() {
						return $.get(editorDiv);
					}
				});

				var node_18 = $.sibling(node_17, 2);

				TableCellResizerPlugin(node_18, {});

				var node_19 = $.sibling(node_18, 2);

				TableActionMenuPlugin(node_19, {
					get anchorElem() {
						return $.get(editorDiv);
					},
					cellMerge: true
				});

				var node_20 = $.sibling(node_19, 2);

				YoutubePlugin(node_20, {});

				var node_21 = $.sibling(node_20, 2);

				TwitterPlugin(node_21, {});

				var node_22 = $.sibling(node_21, 2);

				BlueskyPlugin(node_22, {});

				var node_23 = $.sibling(node_22, 2);

				TabIndentationPlugin(node_23, {});

				var node_24 = $.sibling(node_23, 2);

				ActionBar(node_24, {});
				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		}),
		($$value) => composer($$value),
		() => composer()
	);

	$.pop();
}