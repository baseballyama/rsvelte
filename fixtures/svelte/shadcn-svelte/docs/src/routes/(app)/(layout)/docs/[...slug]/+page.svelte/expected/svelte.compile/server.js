import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
import ComponentCodeViewer from "$lib/components/component-code-viewer/component-code-viewer.svelte";
import CtaMobile from "$lib/components/cta-mobile.svelte";
import Cta from "$lib/components/cta.svelte";
import DocsCopyPage from "$lib/components/docs-copy-page.svelte";
import DocsToc from "$lib/components/docs-toc.svelte";
import Ethical from "$lib/components/ethical.svelte";
import Metadata from "$lib/components/metadata.svelte";
import { findNeighbors } from "$lib/navigation.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const Markdown = $.derived(() => data.component);
		const doc = $.derived(() => data.metadata);
		const apiLink = $.derived(() => doc().links?.api);
		const docLink = $.derived(() => doc().links?.doc);
		const neighbors = $.derived(() => findNeighbors(page.url.pathname));
		const source = $.derived(() => data.viewerData);
		const isChangelog = $.derived(() => page.url.pathname.startsWith("/docs/changelog"));

		Metadata($$renderer, {
			title: doc().title,
			description: doc().description,
			ogImage: {
				url: `/og?title=${encodeURIComponent(doc().title)}&description=${encodeURIComponent(doc().description)}`
			},
			ogType: 'article'
		});

		$$renderer.push(`<!----> <div data-slot="docs" class="flex scroll-mt-24 flex-row-reverse items-stretch text-[1.05rem] sm:text-[15px] xl:w-full" id="main-content"><div class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex" data-llm-ignore=""><div class="h-(--top-spacing) shrink-0"></div> `);

		if (doc().toc.length) {
			$$renderer.push(`<!--[0--><div class="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">`);
			DocsToc($$renderer, { toc: { items: doc().toc } });
			$$renderer.push(`<!----> <div class="h-12"></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex flex-1 flex-col gap-12 px-6">`);
		Cta($$renderer, {});
		$$renderer.push(`<!----></div> <div class="flex flex-col gap-12 px-6">`);
		Ethical($$renderer, {});
		$$renderer.push(`<!----></div></div> <div class="flex min-w-0 flex-1 flex-col"><div class="h-(--top-spacing) shrink-0"></div> <div class="mx-auto flex w-full max-w-[40rem] min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground"><div class="flex flex-col gap-2"><div class="flex flex-col gap-2"><div class="flex items-center justify-between md:items-start"><h1 class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">${$.escape(doc().title)}</h1> <div class="docs-nav flex items-center gap-2" data-llm-ignore=""><div class="hidden md:block">`);
		DocsCopyPage($$renderer, {});
		$$renderer.push(`<!----></div> <div class="ml-auto flex gap-2">`);

		if (neighbors().previous) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'secondary',
				size: 'icon',
				class: 'extend-touch-target size-8 shadow-none md:size-7',
				href: neighbors().previous.href,
				children: ($$renderer) => {
					ArrowLeftIcon($$renderer, {});
					$$renderer.push(`<!----> <span class="sr-only">Previous</span>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (neighbors().next) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				variant: 'secondary',
				size: 'icon',
				class: 'extend-touch-target size-8 shadow-none md:size-7',
				href: neighbors().next.href,
				children: ($$renderer) => {
					$$renderer.push(`<span class="sr-only">Next</span> `);
					ArrowRightIcon($$renderer, {});
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> `);

		if (data.metadata.description) {
			$$renderer.push(`<!--[0--><p class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]">${$.escape(doc().description)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (apiLink() || docLink() || source()) {
			$$renderer.push(`<!--[0--><div class="flex items-center space-x-2 pt-4">`);

			if (docLink()) {
				$$renderer.push('<!--[0-->');

				Badge($$renderer, {
					href: docLink(),
					variant: 'secondary',
					target: '_blank',
					rel: 'noreferrer',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Docs `);
						ArrowUpRight($$renderer, { 'aria-hidden': 'true' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (apiLink()) {
				$$renderer.push('<!--[0-->');

				Badge($$renderer, {
					href: apiLink(),
					variant: 'secondary',
					target: '_blank',
					rel: 'noreferrer',
					children: ($$renderer) => {
						$$renderer.push(`<!---->API Reference `);
						ArrowUpRight($$renderer, { 'aria-hidden': 'true' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (source()) {
				$$renderer.push(`<!--[0--><!---->`);

				{
					ComponentCodeViewer($$renderer, { item: source(), allowSidebar: true });
				}

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);
		CtaMobile($$renderer, {});
		$$renderer.push(`<!----> <div class="w-full flex-1 pb-16 *:data-[slot=alert]:first:mt-0 sm:pb-0">`);

		if (Markdown()) {
			$$renderer.push('<!--[-->');
			Markdown()($$renderer, { viewerData: data.viewerData });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div> `);

		if (!isChangelog()) {
			$$renderer.push(`<!--[0--><div class="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0" data-llm-ignore="">`);

			if (neighbors().previous) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'sm',
					variant: 'secondary',
					class: 'shadow-none',
					href: neighbors().previous.href,
					children: ($$renderer) => {
						ArrowLeftIcon($$renderer, {});
						$$renderer.push(`<!----> ${$.escape(neighbors().previous.title)}`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (neighbors().next) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'sm',
					variant: 'secondary',
					class: 'ml-auto shadow-none',
					href: neighbors().next.href,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(neighbors().next.title)} `);
						ArrowRightIcon($$renderer, {});
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}