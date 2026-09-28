import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8"><!> <div class="h-12"></div></div>`);
var root_1 = $.from_html(`<!> <span class="sr-only">Previous</span>`, 1);
var root_2 = $.from_html(`<span class="sr-only">Next</span> <!>`, 1);
var root_3 = $.from_html(`<p class="text-[1.05rem] text-muted-foreground sm:text-base sm:text-balance md:max-w-[80%]"> </p>`);
var root_4 = $.from_html(`Docs <!>`, 1);
var root_5 = $.from_html(`API Reference <!>`, 1);
var root_6 = $.from_html(`<div class="flex items-center space-x-2 pt-4"><!> <!> <!></div>`);
var root_7 = $.from_html(`<!> `, 1);
var root_8 = $.from_html(` <!>`, 1);
var root_9 = $.from_html(`<div class="hidden h-16 w-full items-center gap-2 px-4 sm:flex sm:px-0" data-llm-ignore=""><!> <!></div>`);
var root_10 = $.from_html(`<!> <div data-slot="docs" class="flex scroll-mt-24 flex-row-reverse items-stretch text-[1.05rem] sm:text-[15px] xl:w-full" id="main-content"><div class="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex" data-llm-ignore=""><div class="h-(--top-spacing) shrink-0"></div> <!> <div class="flex flex-1 flex-col gap-12 px-6"><!></div> <div class="flex flex-col gap-12 px-6"><!></div></div> <div class="flex min-w-0 flex-1 flex-col"><div class="h-(--top-spacing) shrink-0"></div> <div class="mx-auto flex w-full max-w-[40rem] min-w-0 flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground"><div class="flex flex-col gap-2"><div class="flex flex-col gap-2"><div class="flex items-center justify-between md:items-start"><h1 class="scroll-m-24 text-3xl font-semibold tracking-tight sm:text-3xl"> </h1> <div class="docs-nav flex items-center gap-2" data-llm-ignore=""><div class="hidden md:block"><!></div> <div class="ml-auto flex gap-2"><!> <!></div></div></div> <!></div> <!></div> <!> <div class="w-full flex-1 pb-16 *:data-[slot=alert]:first:mt-0 sm:pb-0"><!></div> <!></div></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const Markdown = $.derived(() => $$props.data.component);
	const doc = $.derived(() => $$props.data.metadata);
	const apiLink = $.derived(() => $.get(doc).links?.api);
	const docLink = $.derived(() => $.get(doc).links?.doc);
	const neighbors = $.derived(() => findNeighbors(page.url.pathname));
	const source = $.derived(() => $$props.data.viewerData);
	const isChangelog = $.derived(() => page.url.pathname.startsWith("/docs/changelog"));
	var fragment = root_10();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({
			url: `/og?title=${encodeURIComponent($.get(doc).title)}&description=${encodeURIComponent($.get(doc).description)}`
		}));

		Metadata(node, {
			get title() {
				return $.get(doc).title;
			},

			get description() {
				return $.get(doc).description;
			},

			get ogImage() {
				return $.get($0);
			},
			ogType: 'article'
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var node_1 = $.sibling($.child(div_1), 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_2 = $.child(div_2);

			{
				let $0 = $.derived(() => ({ items: $.get(doc).toc }));

				DocsToc(node_2, {
					get toc() {
						return $.get($0);
					}
				});
			}

			$.next(2);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(doc).toc.length) $$render(consequent);
		});
	}

	var div_3 = $.sibling(node_1, 2);
	var node_3 = $.child(div_3);

	Cta(node_3, {});
	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_4 = $.child(div_4);

	Ethical(node_4, {});
	$.reset(div_4);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var div_7 = $.child(div_6);
	var div_8 = $.child(div_7);
	var div_9 = $.child(div_8);
	var h1 = $.child(div_9);
	var text = $.only_child(h1, true);
	var div_10 = $.sibling(h1, 2);
	var div_11 = $.child(div_10);
	var node_5 = $.child(div_11);

	DocsCopyPage(node_5, {});
	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_6 = $.child(div_12);

	{
		var consequent_1 = ($$anchor) => {
			Button($$anchor, {
				variant: 'secondary',
				size: 'icon',
				class: 'extend-touch-target size-8 shadow-none md:size-7',
				get href() {
					return $.get(neighbors).previous.href;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_7 = $.first_child(fragment_2);

					ArrowLeftIcon(node_7, {});
					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if ($.get(neighbors).previous) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			Button($$anchor, {
				variant: 'secondary',
				size: 'icon',
				class: 'extend-touch-target size-8 shadow-none md:size-7',
				get href() {
					return $.get(neighbors).next.href;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_9 = $.sibling($.first_child(fragment_4), 2);

					ArrowRightIcon(node_9, {});
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_8, ($$render) => {
			if ($.get(neighbors).next) $$render(consequent_2);
		});
	}

	$.reset(div_12);
	$.reset(div_10);
	$.reset(div_9);

	var node_10 = $.sibling(div_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var p = root_3();
			var text_1 = $.only_child(p, true);

			$.template_effect(() => $.set_text(text_1, $.get(doc).description));
			$.append($$anchor, p);
		};

		$.if(node_10, ($$render) => {
			if ($$props.data.metadata.description) $$render(consequent_3);
		});
	}

	$.reset(div_8);

	var node_11 = $.sibling(div_8, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_13 = root_6();
			var node_12 = $.child(div_13);

			{
				var consequent_4 = ($$anchor) => {
					Badge($$anchor, {
						get href() {
							return $.get(docLink);
						},
						variant: 'secondary',
						target: '_blank',
						rel: 'noreferrer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_6 = root_4();
							var node_13 = $.sibling($.first_child(fragment_6));

							ArrowUpRight(node_13, { 'aria-hidden': 'true' });
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_12, ($$render) => {
					if ($.get(docLink)) $$render(consequent_4);
				});
			}

			var node_14 = $.sibling(node_12, 2);

			{
				var consequent_5 = ($$anchor) => {
					Badge($$anchor, {
						get href() {
							return $.get(apiLink);
						},
						variant: 'secondary',
						target: '_blank',
						rel: 'noreferrer',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_8 = root_5();
							var node_15 = $.sibling($.first_child(fragment_8));

							ArrowUpRight(node_15, { 'aria-hidden': 'true' });
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_14, ($$render) => {
					if ($.get(apiLink)) $$render(consequent_5);
				});
			}

			var node_16 = $.sibling(node_14, 2);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_9 = $.comment();
					var node_17 = $.first_child(fragment_9);

					$.key(node_17, () => page.url.pathname, ($$anchor) => {
						ComponentCodeViewer($$anchor, {
							get item() {
								return $.get(source);
							},
							allowSidebar: true
						});
					});

					$.append($$anchor, fragment_9);
				};

				$.if(node_16, ($$render) => {
					if ($.get(source)) $$render(consequent_6);
				});
			}

			$.reset(div_13);
			$.append($$anchor, div_13);
		};

		$.if(node_11, ($$render) => {
			if ($.get(apiLink) || $.get(docLink) || $.get(source)) $$render(consequent_7);
		});
	}

	$.reset(div_7);

	var node_18 = $.sibling(div_7, 2);

	CtaMobile(node_18, {});

	var div_14 = $.sibling(node_18, 2);
	var node_19 = $.child(div_14);

	$.component(node_19, () => $.get(Markdown), ($$anchor, Markdown_1) => {
		Markdown_1($$anchor, {
			get viewerData() {
				return $$props.data.viewerData;
			}
		});
	});

	$.reset(div_14);

	var node_20 = $.sibling(div_14, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_15 = root_9();
			var node_21 = $.child(div_15);

			{
				var consequent_8 = ($$anchor) => {
					Button($$anchor, {
						size: 'sm',
						variant: 'secondary',
						class: 'shadow-none',
						get href() {
							return $.get(neighbors).previous.href;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_7();
							var node_22 = $.first_child(fragment_12);

							ArrowLeftIcon(node_22, {});

							var text_2 = $.sibling(node_22);

							$.template_effect(() => $.set_text(text_2, ` ${$.get(neighbors).previous.title ?? ''}`));
							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_21, ($$render) => {
					if ($.get(neighbors).previous) $$render(consequent_8);
				});
			}

			var node_23 = $.sibling(node_21, 2);

			{
				var consequent_9 = ($$anchor) => {
					Button($$anchor, {
						size: 'sm',
						variant: 'secondary',
						class: 'ml-auto shadow-none',
						get href() {
							return $.get(neighbors).next.href;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_14 = root_8();
							var text_3 = $.first_child(fragment_14);
							var node_24 = $.sibling(text_3);

							ArrowRightIcon(node_24, {});
							$.template_effect(() => $.set_text(text_3, `${$.get(neighbors).next.title ?? ''} `));
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_23, ($$render) => {
					if ($.get(neighbors).next) $$render(consequent_9);
				});
			}

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		$.if(node_20, ($$render) => {
			if (!$.get(isChangelog)) $$render(consequent_10);
		});
	}

	$.reset(div_6);
	$.reset(div_5);
	$.reset(div);
	$.template_effect(() => $.set_text(text, $.get(doc).title));
	$.append($$anchor, fragment);
	$.pop();
}