import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import Toc from "$lib/components/base/toc/toc.svelte";
import { docsV2Pages } from "$lib/config/docs-v2";
import DocsSidebar from "$lib/components/layout/DocsSidebar.svelte";
import { ScrollArea } from "$lib/components/ui/scroll-area";
import { setDocsLayoutContext } from "$lib/components/layout/docs-layout-context";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { UseToc } from "$lib/hooks/use-toc.svelte";
import { cn } from "$lib/utils";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let docContentRef = void 0;
		const toc = new UseToc();

		setDocsLayoutContext({
			registerDocContent: (el) => {
				docContentRef = el;
			}
		});

		const normalizePath = (value) => value === "/" ? value : value.replace(/\/+$/, "");

		const currentPageMeta = $.derived(() => {
			const currentPath = normalizePath(page.url.pathname);

			return docsV2Pages.find((item) => normalizePath(item.path) === currentPath);
		});

		const showToc = $.derived(() => currentPageMeta()?.toc ?? true);

		if (Sidebar.Provider) {
			$$renderer.push('<!--[-->');

			Sidebar.Provider($$renderer, {
				children: ($$renderer) => {
					DocsSidebar($$renderer, {});
					$$renderer.push(`<!----> <div class="grid w-full grid-cols-1 md:grid-cols-8 md:gap-x-6 md:px-6"><div class="py-6 md:col-span-6">`);
					children($$renderer);
					$$renderer.push(`<!----></div> <div class="md:col-span-2">`);

					if (showToc()) {
						$$renderer.push(`<!--[0--><aside class="sticky top-20 hidden lg:block"><div class="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur-sm"><p class="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="14" y1="12" y2="12"></line><line x1="4" x2="10" y1="18" y2="18"></line></svg> On this page</p> `);
						Toc($$renderer, { toc: toc.current });
						$$renderer.push(`<!----></div></aside>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}