import * as $ from 'svelte/internal/server';
import RssIcon from "@lucide/svelte/icons/rss";
import Cta from "$lib/components/cta.svelte";
import Ethical from "$lib/components/ethical.svelte";
import Metadata from "$lib/components/metadata.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const latestPages = $.derived(() => data.latestPages);
		const olderPages = $.derived(() => data.olderPages);
		const dateFormatter = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC", year: "numeric" });

		function getDateLabel(page) {
			return page.date ? dateFormatter.format(page.date) : "Update";
		}

		function getDisplayTitle(title) {
			const [_date, ...titleParts] = title.split(" - ");
			const displayTitle = titleParts.join(" - ").trim();

			return displayTitle || title;
		}

		Metadata($$renderer, {
			title: 'Changelog',
			description: 'Latest updates and announcements.',
			ogImage: {
				url: `/og?title=${encodeURIComponent("Changelog")}&description=${encodeURIComponent("Latest updates and announcements.")}`
			},
			ogType: 'article'
		});

		$$renderer.push(`<!----> <div data-slot="docs" class="flex scroll-mt-24 flex-row-reverse items-stretch text-[1.05rem] sm:text-[15px] xl:w-full" id="main-content"><div class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex" data-llm-ignore=""><div class="h-(--top-spacing) shrink-0"></div> <div class="no-scrollbar overflow-y-auto px-8"><div class="flex flex-col gap-2 p-4 pt-0 text-sm"><p class="sticky top-0 h-6 bg-background text-xs font-medium text-muted-foreground">On This Page</p> <!--[-->`);

		const each_array = $.ensure_array_like(latestPages());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let changelogPage = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', changelogPage.href)} class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground">${$.escape(changelogPage.metadata.title)}</a>`);
		}

		$$renderer.push(`<!--]--> `);

		if (olderPages().length > 0) {
			$$renderer.push(`<!--[0--><a href="#more-updates" class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground">More Updates</a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="h-12"></div></div> <div class="flex flex-1 flex-col gap-12 px-6">`);
		Cta($$renderer, {});
		$$renderer.push(`<!----></div> <div class="flex flex-col gap-12 px-6">`);
		Ethical($$renderer, {});
		$$renderer.push(`<!----></div></div> <div class="flex min-w-0 flex-1 flex-col"><div class="h-(--top-spacing) shrink-0"></div> <div class="mx-auto flex w-full max-w-[40rem] min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground"><div class="flex flex-col gap-2"><div class="flex items-center justify-between md:items-start"><h1 class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">Changelog</h1> <div class="docs-nav flex items-center gap-2" data-llm-ignore="">`);

		Button($$renderer, {
			variant: 'secondary',
			size: 'sm',
			href: '/rss.xml',
			target: '_blank',
			rel: 'noopener noreferrer',
			children: ($$renderer) => {
				RssIcon($$renderer, {});
				$$renderer.push(`<!----> RSS`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <p class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]">Latest updates and announcements.</p></div> <div class="w-full flex-1 pb-16 sm:pb-0"><!--[-->`);

		const each_array_1 = $.ensure_array_like(latestPages());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let changelogPage = each_array_1[$$index_1];
			const ChangelogMarkdown = changelogPage.component;

			if (ChangelogMarkdown) {
				$$renderer.push(`<!--[0--><article class="mb-12 border-b pb-12"><h2 class="font-heading text-xl font-semibold tracking-tight">${$.escape(changelogPage.metadata.title)}</h2> <div class="prose-changelog mt-6 *:first:mt-0">`);

				if (ChangelogMarkdown) {
					$$renderer.push('<!--[-->');
					ChangelogMarkdown($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div></article>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> `);

		if (olderPages().length > 0) {
			$$renderer.push(`<!--[0--><div id="more-updates" class="mb-24 scroll-mt-24"><h2 class="mb-6 font-heading text-xl font-semibold tracking-tight">More Updates</h2> <div class="grid auto-rows-fr gap-3 sm:grid-cols-2"><!--[-->`);

			const each_array_2 = $.ensure_array_like(olderPages());

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let changelogPage = each_array_2[$$index_2];

				$$renderer.push(`<a${$.attr('href', changelogPage.href)} class="flex w-full flex-col rounded-xl bg-surface px-4 py-3 text-surface-foreground transition-colors hover:bg-surface/80"><span class="text-xs text-muted-foreground">${$.escape(getDateLabel(changelogPage))}</span> <span class="text-sm font-medium">${$.escape(getDisplayTitle(changelogPage.metadata.title))}</span></a>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div></div>`);
	});
}