import * as $ from 'svelte/internal/server';
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

export default function RichTextComposer($$renderer, $$props) {
	let { theme } = $$props;
	let composer;

	const initialConfig = {
		namespace: 'Playground',
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
		}
	};

	function getEditor() {
		return composer.getEditor();
	}

	Composer($$renderer, {
		initialConfig,
		children: ($$renderer) => {
			$$renderer.push(`<div class="editor-shell svelte-lexical">`);
			ToolbarRichText($$renderer, {});
			$$renderer.push(`<!----> <div class="editor-container"><div class="editor-scroller"><div class="editor">`);
			ContentEditable($$renderer, {});
			$$renderer.push(`<!----> `);

			PlaceHolder($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Enter rich text...`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div> `);
			AutoFocusPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			RichTextPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			SharedHistoryPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			ListPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckListPlugin($$renderer, {});
			$$renderer.push(`<!----> `);
			HorizontalRulePlugin($$renderer, {});
			$$renderer.push(`<!----> `);

			ImagePlugin($$renderer, {
				children: ($$renderer) => {
					CaptionEditorHistoryPlugin($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			ActionBar($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$.bind_props($$props, { getEditor });
}