import * as $ from 'svelte/internal/server';
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";

export default function _page($$renderer) {
	$.head('rh6xum', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Installation | Shadcn Marketing Blocks</title>`);
		});

		$$renderer.push(`<meta name="description" content="Install &amp; configure Marketing Blocks in your Svelte project using the CLI."/> <meta name="keywords" content="svelte, shadcn, marketing blocks, installation, jsrepo"/>`);
	});

	$$renderer.push(`<main class="space-y-10 xl:mb-24"><div class="space-y-4">`);

	if (Breadcrumb.Root) {
		$$renderer.push('<!--[-->');

		Breadcrumb.Root($$renderer, {
			children: ($$renderer) => {
				if (Breadcrumb.List) {
					$$renderer.push('<!--[-->');

					Breadcrumb.List($$renderer, {
						children: ($$renderer) => {
							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Link) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Link($$renderer, {
												href: '/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Docs`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Page) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Page($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Installation`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <div class="space-y-3.5"><h1 class="text-3xl font-bold -tracking-wide text-primary">Installation</h1> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-primary/50">Install &amp; configure Marketing Blocks in your Svelte project using the CLI.</p> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-primary/50">Here we are using <a href="https://jsrepo.dev" target="_blank" rel="noopener" class="text-yellow-500 underline underline-offset-2">jsrepo CLI</a> to install the blocks.</p></div></div> <div><div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">1</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Create a new Svelte project</h2> `);

	DocsCodeBlock($$renderer, {
		fileName: 'Terminal',
		code: 'npx sv create my-app',
		lang: 'bash'
	});

	$$renderer.push(`<!----></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">2</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Add Tailwind CSS</h2> `);

	DocsCodeBlock($$renderer, {
		fileName: 'Terminal',
		code: 'npx sv add tailwindcss',
		lang: 'bash'
	});

	$$renderer.push(`<!----></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">3</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Add Shadcn Svelte</h2> `);

	DocsCodeBlock($$renderer, {
		fileName: 'Terminal',
		code: 'npx shadcn-svelte@next init',
		lang: 'bash'
	});

	$$renderer.push(`<!----></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">4</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Now Add Any blocks</h2> `);

	DocsCodeBlock($$renderer, {
		fileName: 'Terminal',
		code: 'npx jsrepo add @sv/cnblocks/hero-one',
		lang: 'bash'
	});

	$$renderer.push(`<!----></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">5</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pl-8"><h2 class="font-medium text-primary">Add path to save Component</h2> `);

	DocsCodeBlock($$renderer, {
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

	$$renderer.push(`<!----></div></div></div></div></main>`);
}