import * as $ from 'svelte/internal/server';
import ComponentCodeViewerCodeTitle from "./component-code-viewer-code-title.svelte";
import ComponentCodeViewerFileTree from "./component-code-viewer-file-tree.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";

export default function Component_code_viewer_code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = ComponentCodeViewerContext.get();
		const file = $.derived(() => ctx.highlightedFiles?.find((f) => f.target === ctx.activeFile));
		const showFileTree = $.derived(() => ctx.allowSidebar !== false);
		let codeContainer = null;

		function handleKeydown(event) {
			if (!codeContainer) return;

			if (event.key === "a" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();

				const range = document.createRange();

				range.selectNodeContents(codeContainer);

				const selection = window.getSelection();

				if (!selection) return;

				selection.removeAllRanges();
				selection.addRange(range);
			}
		}

		if (file()) {
			$$renderer.push(`<!--[0--><div class="flex h-(--height) overflow-hidden rounded-xl border bg-code text-code-foreground group-data-[view=preview]/block-view-wrapper:hidden">`);

			if (showFileTree()) {
				$$renderer.push(`<!--[0--><div class="hidden w-72 md:block">`);
				ComponentCodeViewerFileTree($$renderer, {});
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <figure data-rehype-pretty-code-figure="" class="mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none">`);
			ComponentCodeViewerCodeTitle($$renderer, {});
			$$renderer.push(`<!----> <div class="no-scrollbar overflow-y-auto">${$.html(file().highlightedContent)}</div></figure></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}