import * as $ from 'svelte/internal/server';
import BlockViewerCopyCodeButton from "./block-viewer-copy-code-button.svelte";
import BlockViewerFileTree from "./block-viewer-file-tree.svelte";
import { BlockViewerContext } from "./block-viewer.svelte";
import { getIconForLanguageExtension } from "./icons/icons.js";

export default function Block_viewer_code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = BlockViewerContext.get();
		const file = $.derived(() => ctx.item.files?.find((f) => f.target === ctx.activeFile));
		const language = $.derived(() => file()?.target?.split(".").pop() ?? "svelte");
		const Icon = $.derived(() => getIconForLanguageExtension(language()));

		if (file()) {
			$$renderer.push(`<!--[0--><div class="me-3.5 flex overflow-hidden rounded-xl border bg-code text-code-foreground group-data-[view=preview]/block-view-wrapper:hidden md:h-(--height)"><div class="w-72">`);
			BlockViewerFileTree($$renderer, {});
			$$renderer.push(`<!----></div> <figure data-rehype-pretty-code-figure="" class="mx-0! mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none"><figcaption class="flex h-12 shrink-0 items-center gap-2 border-b px-4 py-2 text-code-foreground [&amp;_svg]:size-4 [&amp;_svg]:text-code-foreground [&amp;_svg]:opacity-70"${$.attr('data-language', language())}>`);

			if (Icon()) {
				$$renderer.push('<!--[-->');
				Icon()($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` ${$.escape(file()?.target)} <div class="ms-auto flex items-center gap-2">`);
			BlockViewerCopyCodeButton($$renderer, {});
			$$renderer.push(`<!----></div></figcaption> <div class="no-scrollbar overflow-y-auto">`);

			if (file()?.highlightedContent) {
				$$renderer.push(`<!--[0-->${$.html(file()?.highlightedContent)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></figure></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}