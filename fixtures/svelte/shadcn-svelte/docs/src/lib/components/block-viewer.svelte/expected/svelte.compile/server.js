import * as $ from 'svelte/internal/server';
import { Pane } from "paneforge";
import { Context } from "runed";
import BlockViewerCode from "./block-viewer-code.svelte";
import BlockViewerToolbar from "./block-viewer-toolbar.svelte";
import BlockViewerViewMobile from "./block-viewer-view-mobile.svelte";
import BlockViewerView from "./block-viewer-view.svelte";

export const BlockViewerContext = new Context("BlockViewer");

export default function Block_viewer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, tree, children } = $$props;
		let view = "preview";

		function getFirstFileTargetInTree(_tree = tree) {
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

		let activeFile = getFirstFileTargetInTree() ?? null;
		let resizablePaneRef = null;
		let iframeKey = 0;
		let activeFileCodeToCopy = "";

		BlockViewerContext.set({
			get item() {
				return item;
			},

			get iframeKey() {
				return iframeKey;
			},

			set iframeKey(value) {
				iframeKey = value;
			},

			get view() {
				return view;
			},

			set view(value) {
				view = value;
			},

			get activeFile() {
				return activeFile;
			},

			set activeFile(value) {
				activeFile = value;
			},

			get resizablePaneRef() {
				return resizablePaneRef;
			},

			set resizablePaneRef(value) {
				resizablePaneRef = value;
			},

			get tree() {
				return tree;
			},

			get activeFileCodeToCopy() {
				return activeFileCodeToCopy;
			},

			set activeFileCodeToCopy(value) {
				activeFileCodeToCopy = value;
			}
		});

		$$renderer.push(`<div${$.attr('id', item.name)}${$.attr('data-view', view)} class="group/block-view-wrapper flex min-w-0 scroll-mt-24 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col"${$.attr_style(`--height: ${$.stringify(item.meta?.iframeHeight ?? '930px')}`)}>`);
		BlockViewerToolbar($$renderer, {});
		$$renderer.push(`<!----> `);
		BlockViewerView($$renderer, {});
		$$renderer.push(`<!----> `);
		BlockViewerCode($$renderer, {});
		$$renderer.push(`<!----> `);

		BlockViewerViewMobile($$renderer, {
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}