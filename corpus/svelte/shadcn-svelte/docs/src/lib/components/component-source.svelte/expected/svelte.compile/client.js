import 'svelte/internal/disclose-version';
import { MediaQuery } from "svelte/reactivity";
import ComponentCodeViewerCode from "$lib/components/component-code-viewer/component-code-viewer-code.svelte";
import { ComponentCodeViewerContext } from "$lib/components/component-code-viewer/component-code-viewer.svelte";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<figure data-rehype-pretty-code-figure="" data-llm-ignore=""><div class="group/block-view-wrapper flex w-full min-w-0 flex-col-reverse items-stretch gap-4 overflow-hidden"><!></div></figure>`);

export default function Component_source($$anchor, $$props) {
	$.push($$props, true);

	let allowSidebar = $.prop($$props, 'allowSidebar', 3, false);
	const tree = $.derived(() => createFileTreeForRegistryItemFiles($$props.item.files));
	const highlightedFiles = $.derived(() => $$props.item.files);

	function getFirstFileTargetInTree(_tree = $.get(tree)) {
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
	let activeFileCodeToCopy = $.state("");

	ComponentCodeViewerContext.set({
		get item() {
			return $$props.item;
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
			return $.get(tree);
		},

		get highlightedFiles() {
			return $.get(highlightedFiles);
		},

		get activeFileCodeToCopy() {
			return $.get(activeFileCodeToCopy);
		},

		set activeFileCodeToCopy(value) {
			$.set(activeFileCodeToCopy, value, true);
		},

		get allowSidebar() {
			return allowSidebar();
		}
	});

	const isMobile = new MediaQuery("(max-width: 768px)");

	const longestFileHeight = $.derived(() => {
		if (!$.get(highlightedFiles) || $.get(highlightedFiles).length === 0) return "100%";

		const maxLineCount = $.get(highlightedFiles).reduce(
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
	const height = $.derived(() => `min(${$.get(longestFileHeight)}, ${$.get(viewportHeight)})`);
	var figure = root();
	var div = $.child(figure);
	var node_1 = $.child(div);

	ComponentCodeViewerCode(node_1, {});
	$.reset(div);
	$.reset(figure);

	$.template_effect(() => {
		$.set_attribute(figure, 'id', $$props.item.name);
		$.set_style(div, `--height: ${$.get(height) ?? ''};`);
	});

	$.append($$anchor, figure);
	$.pop();
}