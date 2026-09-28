import 'svelte/internal/disclose-version';
import { Pane } from "paneforge";
import { Context } from "runed";
import BlockViewerCode from "./block-viewer-code.svelte";
import BlockViewerToolbar from "./block-viewer-toolbar.svelte";
import BlockViewerViewMobile from "./block-viewer-view-mobile.svelte";
import BlockViewerView from "./block-viewer-view.svelte";
import * as $ from 'svelte/internal/client';

export const BlockViewerContext = new Context("BlockViewer");

var root = $.from_html(`<div class="group/block-view-wrapper flex min-w-0 scroll-mt-24 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col"><!> <!> <!> <!></div>`);

export default function Block_viewer($$anchor, $$props) {
	$.push($$props, true);

	let view = $.state("preview");

	function getFirstFileTargetInTree(_tree = $$props.tree) {
		if (!_tree?.length) return null;

		for (const node of _tree) {
			if (node.path) return node.path;

			if (node.children) {
				const result = getFirstFileTargetInTree(node.children);

				if (result) return result;
			}
		}

		return null;
	}

	let activeFile = $.state($.proxy(getFirstFileTargetInTree() ?? null));
	let resizablePaneRef = $.state(null);
	let iframeKey = $.state(0);
	let activeFileCodeToCopy = $.state("");

	BlockViewerContext.set({
		get item() {
			return $$props.item;
		},

		get iframeKey() {
			return $.get(iframeKey);
		},

		set iframeKey(value) {
			$.set(iframeKey, value, true);
		},

		get view() {
			return $.get(view);
		},

		set view(value) {
			$.set(view, value, true);
		},

		get activeFile() {
			return $.get(activeFile);
		},

		set activeFile(value) {
			$.set(activeFile, value, true);
		},

		get resizablePaneRef() {
			return $.get(resizablePaneRef);
		},

		set resizablePaneRef(value) {
			$.set(resizablePaneRef, value, true);
		},

		get tree() {
			return $$props.tree;
		},

		get activeFileCodeToCopy() {
			return $.get(activeFileCodeToCopy);
		},

		set activeFileCodeToCopy(value) {
			$.set(activeFileCodeToCopy, value, true);
		}
	});

	var div = root();
	var node_1 = $.child(div);

	BlockViewerToolbar(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	BlockViewerView(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	BlockViewerCode(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	BlockViewerViewMobile(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment = $.comment();
			var node_5 = $.first_child(fragment);

			$.snippet(node_5, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'id', $$props.item.name);
		$.set_attribute(div, 'data-view', $.get(view));
		$.set_style(div, `--height: ${$$props.item.meta?.iframeHeight ?? '930px' ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}