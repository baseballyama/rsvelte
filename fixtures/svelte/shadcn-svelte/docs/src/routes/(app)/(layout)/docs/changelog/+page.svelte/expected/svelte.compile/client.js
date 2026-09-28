import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RssIcon from "@lucide/svelte/icons/rss";
import Cta from "$lib/components/cta.svelte";
import Ethical from "$lib/components/ethical.svelte";
import Metadata from "$lib/components/metadata.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<a class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground"> </a>`);
var root_1 = $.from_html(`<a href="#more-updates" class="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground">More Updates</a>`);
var root_2 = $.from_html(`<!> RSS`, 1);
var root_3 = $.from_html(`<article class="mb-12 border-b pb-12"><h2 class="font-heading text-xl font-semibold tracking-tight"> </h2> <div class="prose-changelog mt-6 *:first:mt-0"><!></div></article>`);
var root_4 = $.from_html(`<a class="flex w-full flex-col rounded-xl bg-surface px-4 py-3 text-surface-foreground transition-colors hover:bg-surface/80"><span class="text-xs text-muted-foreground"> </span> <span class="text-sm font-medium"> </span></a>`);
var root_5 = $.from_html(`<div id="more-updates" class="mb-24 scroll-mt-24"><h2 class="mb-6 font-heading text-xl font-semibold tracking-tight">More Updates</h2> <div class="grid auto-rows-fr gap-3 sm:grid-cols-2"></div></div>`);
var root_6 = $.from_html(`<!> <div data-slot="docs" class="flex scroll-mt-24 flex-row-reverse items-stretch text-[1.05rem] sm:text-[15px] xl:w-full" id="main-content"><div class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex" data-llm-ignore=""><div class="h-(--top-spacing) shrink-0"></div> <div class="no-scrollbar overflow-y-auto px-8"><div class="flex flex-col gap-2 p-4 pt-0 text-sm"><p class="sticky top-0 h-6 bg-background text-xs font-medium text-muted-foreground">On This Page</p> <!> <!></div> <div class="h-12"></div></div> <div class="flex flex-1 flex-col gap-12 px-6"><!></div> <div class="flex flex-col gap-12 px-6"><!></div></div> <div class="flex min-w-0 flex-1 flex-col"><div class="h-(--top-spacing) shrink-0"></div> <div class="mx-auto flex w-full max-w-[40rem] min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground"><div class="flex flex-col gap-2"><div class="flex items-center justify-between md:items-start"><h1 class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl">Changelog</h1> <div class="docs-nav flex items-center gap-2" data-llm-ignore=""><!></div></div> <p class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]">Latest updates and announcements.</p></div> <div class="w-full flex-1 pb-16 sm:pb-0"><!> <!></div></div></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const latestPages = $.derived(() => $$props.data.latestPages);
	const olderPages = $.derived(() => $$props.data.olderPages);
	const dateFormatter = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC", year: "numeric" });

	function getDateLabel(page) {
		return page.date ? dateFormatter.format(page.date) : "Update";
	}

	function getDisplayTitle(title) {
		const [_date, ...titleParts] = title.split(" - ");
		const displayTitle = titleParts.join(" - ").trim();

		return displayTitle || title;
	}

	var fragment = root_6();
	var node = $.first_child(fragment);

	Metadata(node, {
		title: 'Changelog',
		description: 'Latest updates and announcements.',
		ogImage: {
			url: `/og?title=${encodeURIComponent("Changelog")}&description=${encodeURIComponent("Latest updates and announcements.")}`
		},
		ogType: 'article'
	});

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var div_3 = $.child(div_2);
	var node_1 = $.sibling($.child(div_3), 2);

	$.each(node_1, 17, () => $.get(latestPages), (changelogPage) => changelogPage.href, ($$anchor, changelogPage) => {
		var a = root();
		var text = $.only_child(a, true);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(changelogPage).href);
			$.set_text(text, $.get(changelogPage).metadata.title);
		});

		$.append($$anchor, a);
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var a_1 = root_1();

			$.append($$anchor, a_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(olderPages).length > 0) $$render(consequent);
		});
	}

	$.reset(div_3);
	$.next(2);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_3 = $.child(div_4);

	Cta(node_3, {});
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_4 = $.child(div_5);

	Ethical(node_4, {});
	$.reset(div_5);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var div_7 = $.sibling($.child(div_6), 2);
	var div_8 = $.child(div_7);
	var div_9 = $.child(div_8);
	var div_10 = $.sibling($.child(div_9), 2);
	var node_5 = $.child(div_10);

	Button(node_5, {
		variant: 'secondary',
		size: 'sm',
		href: '/rss.xml',
		target: '_blank',
		rel: 'noopener noreferrer',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_6 = $.first_child(fragment_1);

			RssIcon(node_6, {});
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_10);
	$.reset(div_9);
	$.next(2);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var node_7 = $.child(div_11);

	$.each(node_7, 17, () => $.get(latestPages), (changelogPage) => changelogPage.href, ($$anchor, changelogPage) => {
		const ChangelogMarkdown = $.derived(() => $.get(changelogPage).component);
		var fragment_2 = $.comment();
		var node_8 = $.first_child(fragment_2);

		{
			var consequent_1 = ($$anchor) => {
				var article = root_3();
				var h2 = $.child(article);
				var text_1 = $.only_child(h2, true);
				var div_12 = $.sibling(h2, 2);
				var node_9 = $.child(div_12);

				$.component(node_9, () => $.get(ChangelogMarkdown), ($$anchor, ChangelogMarkdown_1) => {
					ChangelogMarkdown_1($$anchor, {});
				});

				$.reset(div_12);
				$.reset(article);
				$.template_effect(() => $.set_text(text_1, $.get(changelogPage).metadata.title));
				$.append($$anchor, article);
			};

			$.if(node_8, ($$render) => {
				if ($.get(ChangelogMarkdown)) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_2);
	});

	var node_10 = $.sibling(node_7, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_13 = root_5();
			var div_14 = $.sibling($.child(div_13), 2);

			$.each(div_14, 21, () => $.get(olderPages), (changelogPage) => changelogPage.href, ($$anchor, changelogPage) => {
				var a_2 = root_4();
				var span = $.child(a_2);
				var text_2 = $.only_child(span, true);
				var span_1 = $.sibling(span, 2);
				var text_3 = $.only_child(span_1, true);

				$.reset(a_2);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a_2, 'href', $.get(changelogPage).href);
						$.set_text(text_2, $0);
						$.set_text(text_3, $1);
					},
					[
						() => getDateLabel($.get(changelogPage)),
						() => getDisplayTitle($.get(changelogPage).metadata.title)
					]
				);

				$.append($$anchor, a_2);
			});

			$.reset(div_14);
			$.reset(div_13);
			$.append($$anchor, div_13);
		};

		$.if(node_10, ($$render) => {
			if ($.get(olderPages).length > 0) $$render(consequent_2);
		});
	}

	$.reset(div_11);
	$.reset(div_7);
	$.reset(div_6);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}