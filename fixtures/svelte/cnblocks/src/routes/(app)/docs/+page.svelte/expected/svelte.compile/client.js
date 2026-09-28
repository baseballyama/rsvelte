import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";
import { marked } from "marked";

var root = $.from_html(`<meta name="description" content="Welcome to Shadcn Marketing Blocks! This is a collection of marketing components built with Svelte 5, Tailwind CSS v4 and Shadcn Svelte."/> <meta name="keywords" content="svelte, shadcn, marketing blocks, installation, jsrepo"/>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<a target="_blank" class="group"><div class="size-20 rounded-full border bg-background p-0.5 shadow shadow-zinc-950/5"><img class="aspect-square rounded-full object-cover" height="460" width="460" loading="lazy"/></div> <span class="mt-2 block text-sm"> </span> <span class="block text-xs text-muted-foreground group-hover:text-yellow-500"> </span></a>`);

var root_3 = $.from_html(`<main class="space-y-6 xl:mb-24"><div class="space-y-4"><!> <div class="space-y-3.5"><h1 class="text-3xl font-bold -tracking-wide text-primary">Introduction</h1> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-muted-foreground">Welcome to Shadcn Marketing Blocks! <br/> This is a collection of marketing components built with Svelte 5, Tailwind CSS v4 and
				Shadcn Svelte.</p> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-muted-foreground">This project is inspired by <a href="https://tailark.com" class="text-primary underline" target="_blank">Tailark</a>, this project is designed to bring a similarly smooth and efficient experience to
				Svelte developers, with a focus on building landing and marketing pages
				effortlessly.</p></div> <div class="prose dark:prose-invert prose-p:my-1 prose-li:my-1 prose-h2:my-3.5 max-w-none"></div></div> <div class="grid grid-cols-2 gap-4 border-t py-4 md:grid-cols-6"></div></main>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const members = [
		{
			name: "Bhide Svelte",
			role: "Svelte Developer",
			avatar: "https://avatars.githubusercontent.com/u/93428946?v=4",
			href: "https://github.com/SikandarJODD"
		},

		{
			name: "Aidan Bleser",
			role: "Creator of JSrepo",
			avatar: "https://avatars.githubusercontent.com/u/117548273?v=4",
			href: "https://github.com/ieedan"
		}
	];

	let overview_content = `## Overview
  Svelte Shadcn Blocks consists of 2 main variants:

1. **Normal** - A vibrant, bold design with a focus on marketing and UI components.
2. **Mist** - A clean, minimal design inspired by Notion, perfect for documentation and content-heavy applications.

Each variant include **50+ blocks** that can be used in your projects. These blocks are designed to be easily customizable and integrate seamlessly with your Svelte applications.

You can use these blocks to build landing pages, marketing sites, dashboards, and more.
  `;

	var main = root_3();

	$.head('c4aoil', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'Shadcn Marketing Blocks';
		});

		$.append($$anchor, fragment);
	});

	var div = $.child(main);
	var node = $.child(div);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
											Breadcrumb_Link($$anchor, {
												href: '/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Docs');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
								Breadcrumb_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Introduction');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var div_1 = $.sibling(node, 4);

	$.html(div_1, () => marked(overview_content), true);
	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);

	$.each(div_2, 21, () => members, $.index, ($$anchor, member) => {
		var a = root_2();
		var div_3 = $.child(a);
		var img = $.only_child(div_3);
		var span = $.sibling(div_3, 2);
		var text_2 = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_3 = $.only_child(span_1, true);

		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(member).href);
			$.set_attribute(img, 'src', $.get(member).avatar);
			$.set_attribute(img, 'alt', $.get(member).name);
			$.set_text(text_2, $.get(member).name);
			$.set_text(text_3, $.get(member).role);
		});

		$.append($$anchor, a);
	});

	$.reset(div_2);
	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}