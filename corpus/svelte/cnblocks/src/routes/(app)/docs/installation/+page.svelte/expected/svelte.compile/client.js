import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";

var root = $.from_html(`<meta name="description" content="Install &amp; configure Marketing Blocks in your Svelte project using the CLI."/> <meta name="keywords" content="svelte, shadcn, marketing blocks, installation, jsrepo"/>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<main class="space-y-10 xl:mb-24"><div class="space-y-4"><!> <div class="space-y-3.5"><h1 class="text-3xl font-bold -tracking-wide text-primary">Installation</h1> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-primary/50">Install & configure Marketing Blocks in your Svelte project using the CLI.</p> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-primary/50">Here we are using <a href="https://jsrepo.dev" target="_blank" rel="noopener" class="text-yellow-500 underline underline-offset-2">jsrepo CLI</a> to install the blocks.</p></div></div> <div><div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">1</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Create a new Svelte project</h2> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">2</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Add Tailwind CSS</h2> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">3</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Add Shadcn Svelte</h2> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">4</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Now Add Any blocks</h2> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">5</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pl-8"><h2 class="font-medium text-primary">Add path to save Component</h2> <!></div></div></div></div></main>`);

export default function _page($$anchor) {
	var main = root_2();

	$.head('rh6xum', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'Installation | Shadcn Marketing Blocks';
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

													var text_1 = $.text('Installation');

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

	$.next(2);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);
	var div_4 = $.child(div_3);
	var node_7 = $.sibling($.child(div_4), 2);

	DocsCodeBlock(node_7, {
		fileName: 'Terminal',
		code: 'npx sv create my-app',
		lang: 'bash'
	});

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var div_7 = $.child(div_6);
	var node_8 = $.sibling($.child(div_7), 2);

	DocsCodeBlock(node_8, {
		fileName: 'Terminal',
		code: 'npx sv add tailwindcss',
		lang: 'bash'
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var div_10 = $.child(div_9);
	var node_9 = $.sibling($.child(div_10), 2);

	DocsCodeBlock(node_9, {
		fileName: 'Terminal',
		code: 'npx shadcn-svelte@next init',
		lang: 'bash'
	});

	$.reset(div_10);
	$.reset(div_9);
	$.reset(div_8);

	var div_11 = $.sibling(div_8, 2);
	var div_12 = $.sibling($.child(div_11), 2);
	var div_13 = $.child(div_12);
	var node_10 = $.sibling($.child(div_13), 2);

	DocsCodeBlock(node_10, {
		fileName: 'Terminal',
		code: 'npx jsrepo add @sv/cnblocks/hero-one',
		lang: 'bash'
	});

	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 2);
	var div_15 = $.sibling($.child(div_14), 2);
	var div_16 = $.child(div_15);
	var node_11 = $.sibling($.child(div_16), 2);

	DocsCodeBlock(node_11, {
		fileName: 'Terminal',
		code: `┌  jsrepo v1.47.0
│
◇ Please enter a default path to install the blocks
│ ./src/blocks
│
● Initializing @sv/cnblocks
│
◇ Fetched manifest from @sv/cnblocks
│
└ All done!`,
		lang: 'bash'
	});

	$.reset(div_16);
	$.reset(div_15);
	$.reset(div_14);
	$.reset(div_1);
	$.reset(main);
	$.append($$anchor, main);
}