import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_iframe($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className } = $$props;
		const ctx = BlockViewerContext.get();

		$$renderer.push(`<!---->`);

		{
			$$renderer.push(`<iframe${$.attr('title', ctx.item.name)}${$.attr('src', `/view/${$.stringify(ctx.item.name)}`)}${$.attr('height', typeof ctx.item.meta?.iframeHeight === "number" ? ctx.item.meta.iframeHeight : 930)}${$.attr_class($.clsx(cn("relative z-20 no-scrollbar w-full bg-background", className)))} loading="lazy"></iframe>`);
		}

		$$renderer.push(`<!---->`);
	});
}