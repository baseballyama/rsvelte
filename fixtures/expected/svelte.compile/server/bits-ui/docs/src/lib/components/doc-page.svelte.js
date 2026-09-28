import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { cn } from "$lib/utils/styles.js";
import Metadata from "./metadata.svelte";
import Toc from "./toc/toc.svelte";
import DocPageHeader from "./doc-page-header.svelte";
import SidebarSponsor from "./sidebar-sponsor.svelte";
import DocsPager from "./docs-pager.svelte";

export default function Doc_page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { component, metadata, schemas = [] } = $$props;
		const PageComponent = $.derived(() => component);

		const apiSchemaToc = $.derived(() => {
			if (!schemas.length) return null;

			return {
				title: "API Reference",
				url: "#api-reference",
				items: schemas.map((schema) => ({ title: schema.title, url: `#${schema.title.toLowerCase()}` }))
			};
		});

		const fullToc = $.derived(() => apiSchemaToc() ? [...metadata.toc, apiSchemaToc()] : metadata.toc);

		Metadata($$renderer, $.spread_props([metadata]));
		$$renderer.push(`<!----> <div${$.attr_class($.clsx(cn("relative flex flex-row-reverse pl-4 pr-4 pt-8 sm:pt-16 md:pl-0 lg:gap-10 xl:grid-cols-[1fr_220px]", page.error ?? "xl:grid")))}>`);

		if (!page.error) {
			$$renderer.push(`<!--[0--><aside class="order-2 hidden text-sm xl:block"><div class="sticky top-[var(--header-height)] -mt-16 flex h-[calc(100vh-var(--header-height))] flex-col gap-4 overflow-hidden pt-6"><!---->`);

			{
				Toc($$renderer, { toc: { items: fullToc() } });
			}

			$$renderer.push(`<!----> `);
			SidebarSponsor($$renderer, {});
			$$renderer.push(`<!----></div></aside>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="order-1 mx-auto w-full min-w-0 md:max-w-[760px]"><main class="markdown pb-24" id="main-content">`);
		DocPageHeader($$renderer, { metadata });
		$$renderer.push(`<!----> `);

		if (PageComponent()) {
			$$renderer.push('<!--[-->');
			PageComponent()($$renderer, { schemas });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		DocsPager($$renderer, {});
		$$renderer.push(`<!----></main></div></div>`);
	});
}