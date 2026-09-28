import * as $ from 'svelte/internal/server';
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_view_mobile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = BlockViewerContext.get();
		let { children } = $$props;

		$$renderer.push(`<div class="flex flex-col gap-2 lg:hidden"><div class="flex items-center gap-2 px-2"><div class="line-clamp-1 text-sm font-medium">${$.escape(ctx.item.description)}</div> <div class="ms-auto shrink-0 font-mono text-xs text-muted-foreground">${$.escape(ctx.item.name)}</div></div> `);

		if (ctx.item.meta?.mobile === "component") {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="overflow-hidden rounded-xl border"><img${$.attr('src', `/img/registry/${$.stringify(ctx.item.name)}-light.png`)}${$.attr('alt', ctx.item.name)}${$.attr('data-block', ctx.item.name)}${$.attr('width', 1440)}${$.attr('height', 900)} class="object-cover dark:hidden"/> <img${$.attr('src', `/img/registry/${$.stringify(ctx.item.name)}-dark.png`)}${$.attr('alt', ctx.item.name)}${$.attr('data-block', ctx.item.name)}${$.attr('width', 1440)}${$.attr('height', 900)} class="hidden object-cover dark:block"/></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}