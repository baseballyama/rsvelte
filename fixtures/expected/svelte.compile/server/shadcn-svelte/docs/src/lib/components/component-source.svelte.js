import * as $ from 'svelte/internal/server';
import { MediaQuery } from "svelte/reactivity";
import ComponentCodeViewerCode from "$lib/components/component-code-viewer/component-code-viewer-code.svelte";
import { ComponentCodeViewerContext } from "$lib/components/component-code-viewer/component-code-viewer.svelte";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";

export default function Component_source($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, allowSidebar = false } = $$props;
		const tree = $.derived(() => createFileTreeForRegistryItemFiles(item.files));
		const highlightedFiles = $.derived(() => item.files);

		function getFirstFileTargetInTree(_tree = tree()) {
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
		let activeFileCodeToCopy = "";

		ComponentCodeViewerContext.set({
			get item() {
				return item;
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
				return tree();
			},

			get highlightedFiles() {
				return highlightedFiles();
			},

			get activeFileCodeToCopy() {
				return activeFileCodeToCopy;
			},

			set activeFileCodeToCopy(value) {
				activeFileCodeToCopy = value;
			},

			get allowSidebar() {
				return allowSidebar;
			}
		});

		const isMobile = new MediaQuery("(max-width: 768px)");

		const longestFileHeight = $.derived(() => {
			if (!highlightedFiles() || highlightedFiles().length === 0) return "100%";

			const maxLineCount = highlightedFiles().reduce(
				(max, file) => {
					const lineCount = file.highlightedContent.split("\n").length;

					return Math.max(max, lineCount);
				},
				0
			);

			// Estimate height: ~1.5rem per line (adjust based on your font size)
			return `${maxLineCount * 1.5}rem`;
		});

		const viewportHeight = $.derived(() => isMobile.current ? "75dvh" : "calc(100svh - (var(--header-height) * 2))");
		const height = $.derived(() => `min(${longestFileHeight()}, ${viewportHeight()})`);

		$$renderer.push(`<figure data-rehype-pretty-code-figure="" data-llm-ignore=""${$.attr('id', item.name)}><div class="group/block-view-wrapper flex w-full min-w-0 flex-col-reverse items-stretch gap-4 overflow-hidden"${$.attr_style(`--height: ${height()};`)}>`);
		ComponentCodeViewerCode($$renderer, {});
		$$renderer.push(`<!----></div></figure>`);
	});
}