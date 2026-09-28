import * as $ from 'svelte/internal/server';
import Footer from "../../utils/Footer.svelte";
import MetaTag from "../../utils/MetaTag.svelte";
import Newsletter from "../../utils/Newsletter.svelte";
import PageHeadSection from "../../utils/PageHeadSection.svelte";
import Paging from "../../utils/Paging.svelte";
import SectionHeader from "../../blocks/utils/SectionHeader.svelte";
import code from "./code.svelte";
import h2 from "./h2.svelte";
import h3 from "./h3.svelte";

export { code, h2, h3 };

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title,
			breadcrumb_title,
			component_title = "",
			dir,
			description,
			layout = "",
			category,
			children,
			pkg = "Flowbite Svelte"
		} = $$props;

		// calm down `unused export property` warning - use them in $effect
		/* eslint-disable @typescript-eslint/no-unused-expressions */
		const blockDirs = new Set(["application", "marketing", "publisher", "quickstart"]);

		const pageWidth = $.derived(() => blockDirs.has(dir) ? "max-w-8xl" : "max-w-4xl");

		let divClass = $.derived(() => category
			? ""
			: "mx-auto max-w-8xl lg:px-20 px-8 md:px-auto py-8");

		MetaTag($$renderer, { breadcrumb_title, title, dir, description, pkg });
		$$renderer.push(`<!----> `);

		if (blockDirs.has(dir)) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(divClass()))}>`);
			SectionHeader($$renderer, { category: dir, breadcrumb_title, title, description });
			$$renderer.push(`<!----> <div id="mainContent">`);
			children($$renderer);
			$$renderer.push(`<!----> `);
			Paging($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="flex w-full"><div${$.attr_class(`pb:12 mx-auto flex min-w-0 flex-col px-4 pt-6 lg:px-8 lg:pt-8 lg:pb-16 xl:pb-24 ${pageWidth()}`)}>`);
			PageHeadSection($$renderer, { title, description });
			$$renderer.push(`<!----> <div id="mainContent" class="py-8">`);
			children($$renderer);
			$$renderer.push(`<!----> `);
			Paging($$renderer, {});
			$$renderer.push(`<!----></div> `);
			Newsletter($$renderer, {});
			$$renderer.push(`<!----> `);
			Footer($$renderer, {});
			$$renderer.push(`<!----></div></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}