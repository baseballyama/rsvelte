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
	CodeActionMenuPlugin
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
import Composer5Toolbar from './Composer5Toolbar.svelte';

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="editor-shell svelte-lexical"><!> <div class="editor-container"><div class="editor-scroller"><div class="editor"><!></div></div> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div></div>`);

export default function Composer5Code($$anchor, $$props) {
	$.push($$props, true);

	let isSmallWidthViewport = $.state(true);
	let editorDiv = $.state(void 0);

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
			AutoLinkNode,
			CodeNode,
			CodeHighlightNode
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

	Composer($$anchor, {
		get initialConfig() {
			return initialConfig;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			Composer5Toolbar(node, {});

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

			AutoLinkPlugin(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			LinkPlugin(node_9, {
				get validateUrl() {
					return validateUrl;
				}
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

			ActionBar(node_15, {});
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}