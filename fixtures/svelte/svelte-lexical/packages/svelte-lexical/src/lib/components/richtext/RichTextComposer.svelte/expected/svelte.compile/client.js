import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import Composer from '$lib/core/Composer.svelte';
import ContentEditable from '$lib/core/ContentEditable.svelte';
import SharedHistoryPlugin from '$lib/core/plugins/SharedHistoryPlugin.svelte';
import { HorizontalRuleNode } from '$lib/core/plugins/HorizontalRuleNode.js';
import { ImageNode } from '$lib/core/plugins/Image/ImageNode.js';
import ImagePlugin from '$lib/core/plugins/Image/ImagePlugin.svelte';
import ListPlugin from '$lib/core/plugins/ListPlugin.svelte';
import CheckListPlugin from '$lib/core/plugins/CheckListPlugin.svelte';
import HorizontalRulePlugin from '$lib/core/plugins/HorizontalRulePlugin.svelte';
import RichTextPlugin from '$lib/core/plugins/RichTextPlugin.svelte';
import ActionBar from '../actionbar/ActionBar.svelte';
import ToolbarRichText from './ToolbarRichText.svelte';
import PlaceHolder from '$lib/core/plugins/PlaceHolder.svelte';
import AutoFocusPlugin from '$lib/core/plugins/AutoFocusPlugin.svelte';
import CaptionEditorHistoryPlugin from '$lib/core/plugins/Image/CaptionEditorHistoryPlugin.svelte';

var root = $.from_html(`<div class="editor-shell svelte-lexical"><!> <div class="editor-container"><div class="editor-scroller"><div class="editor"><!> <!></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div></div>`);

export default function RichTextComposer($$anchor, $$props) {
	$.push($$props, true);

	let composer;

	const initialConfig = {
		namespace: 'Playground',
		theme: $$props.theme,
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
		}
	};

	function getEditor() {
		return composer.getEditor();
	}

	var $$exports = { getEditor };

	$.bind_this(
		Composer($$anchor, {
			get initialConfig() {
				return initialConfig;
			},

			children: ($$anchor, $$slotProps) => {
				var div = root();
				var node = $.child(div);

				ToolbarRichText(node, {});

				var div_1 = $.sibling(node, 2);
				var div_2 = $.child(div_1);
				var div_3 = $.child(div_2);
				var node_1 = $.child(div_3);

				ContentEditable(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				PlaceHolder(node_2, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Enter rich text...');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.reset(div_2);

				var node_3 = $.sibling(div_2, 2);

				AutoFocusPlugin(node_3, {});

				var node_4 = $.sibling(node_3, 2);

				RichTextPlugin(node_4, {});

				var node_5 = $.sibling(node_4, 2);

				SharedHistoryPlugin(node_5, {});

				var node_6 = $.sibling(node_5, 2);

				ListPlugin(node_6, {});

				var node_7 = $.sibling(node_6, 2);

				CheckListPlugin(node_7, {});

				var node_8 = $.sibling(node_7, 2);

				HorizontalRulePlugin(node_8, {});

				var node_9 = $.sibling(node_8, 2);

				ImagePlugin(node_9, {
					children: ($$anchor, $$slotProps) => {
						CaptionEditorHistoryPlugin($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_10 = $.sibling(node_9, 2);

				ActionBar(node_10, {});
				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		}),
		($$value) => composer = $$value,
		() => composer
	);

	return $.pop($$exports);
}