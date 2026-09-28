import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index";

var root = $.from_html(`<meta name="description" content="Install &amp; configure Marketing Blocks in your Svelte project using the CLI."/> <meta name="keywords" content="svelte, shadcn, marketing blocks, installation, jsrepo, mcp"/>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<main class="space-y-10 xl:mb-24"><div class="space-y-4"><!> <div class="space-y-3.5"><h1 class="text-3xl font-bold -tracking-wide text-primary">MCP Server Integration for Cursor | Windsurf</h1> <p class="text-[16px] leading-relaxed font-normal text-black/80 dark:text-primary/50">Here we are using <a href="https://jsrepo.dev/docs/registry/mcp" target="_blank" rel="noopener" class="text-yellow-500 underline underline-offset-2">jsrepo</a> to integrate MCP Server to your project.</p></div></div> <div><div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">1</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-8 pl-8"><h2 class="font-medium text-primary">Cursor Usage</h2> <p class="text-sm text-muted-foreground">Add the following code to your <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.cursor/mcp.json</code> file:</p> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">2</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Windsurf Usage</h2> <p class="text-sm text-muted-foreground">Add the following code to your <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.codeium/windsurf/mcp_config.json</code> file:</p> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">3</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Add Cursor Rules</h2> <p class="text-sm text-muted-foreground">Create new file in <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">.cursor/rules</code> folder and create new file <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">svelte-blocks.mdc</code> and add the following code:</p> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">4</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Install jsrepo & Run MCP Server</h2> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">5</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Create jsrepo.json</h2> <p class="text-sm text-muted-foreground">Create a new file in the root of your project named <code class="rounded-sm bg-secondary px-1 py-0.5 font-mono text-primary">jsrepo.json</code> and add the following code:</p> <!></div></div></div> <div class="relative"><div class="absolute flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-background bg-neutral-300 select-none dark:bg-neutral-800"><span class="font-semibold text-primary">6</span></div> <div class="ml-[1.1rem] border-l border-neutral-200 dark:border-neutral-900"><div class="space-y-4 pt-1 pb-10 pl-8"><h2 class="font-medium text-primary">Example Prompt</h2> <!></div></div></div></div></main>`);

export default function _page($$anchor) {
	var main = root_2();

	$.head('1uks004', ($$anchor) => {
		var fragment = root();

		$.next(2);

		$.effect(() => {
			$.document.title = 'MCP Server | Shadcn Marketing Blocks';
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

													var text_1 = $.text('MCP Server');

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
	var node_7 = $.sibling($.child(div_4), 4);

	DocsCodeBlock(node_7, {
		fileName: 'Terminal',
		code: `   {
    	"mcpServers": {
    		"jsrepo": {
    			"command": "npx",
    			"args": ["jsrepo", "mcp"]
    		}
    	}
    }`,
		lang: 'json'
	});

	$.reset(div_4);
	$.reset(div_3);
	$.reset(div_2);

	var div_5 = $.sibling(div_2, 2);
	var div_6 = $.sibling($.child(div_5), 2);
	var div_7 = $.child(div_6);
	var node_8 = $.sibling($.child(div_7), 4);

	DocsCodeBlock(node_8, {
		fileName: 'Terminal',
		code: `   {
    	"mcpServers": {
    		"jsrepo": {
    			"command": "npx",
    			"args": ["jsrepo", "mcp"]
    		}
    	}
    }`,
		lang: 'json'
	});

	$.reset(div_7);
	$.reset(div_6);
	$.reset(div_5);

	var div_8 = $.sibling(div_5, 2);
	var div_9 = $.sibling($.child(div_8), 2);
	var div_10 = $.child(div_9);
	var node_9 = $.sibling($.child(div_10), 4);

	DocsCodeBlock(node_9, {
		fileName: 'Terminal',
		code: `
---
description: Svelte Marketing Blocks
globs:
alwaysApply: true
---

# Svelte Marketing Blocks

## Project Description
You are working with Svelte Marketing Blocks, a collection of 100+ beautifully crafted components built with:
- Svelte 5
- Tailwind CSS 4
- shadcn-svelte components

These components are ideal for building high-converting marketing, landing, and product pages, and cover:
Hero, Feature, Content, Testimonial, Pricing, FAQ, CTA, Integration, Header, Footer, and more.

## General Instructions
- Use components from this library unless explicitly asked otherwise.
- Use Svelte 5 and support for children snippet, props, and actions.
- Style exclusively with Tailwind CSS 4, no inline styles.
- Use shadcn-svelte for buttons, cards, modals, accordions, and UI primitives.
- Ensure accessibility with proper roles, labels, alt text, and keyboard navigation where applicable.

## What Users Want
- Users are building beautiful, functional, responsive marketing pages.
- Pages should convert, look modern, and follow UI best practices.
- Components should be easy to customize, with clear slots and props.
- Code must be modular, clean, and production-ready.
- Use Images from Unsplash if not present or has static image.

## Component Usage Guidelines
- Component names follow the format: <HeroOne />, <FeatureTwo />, etc.
- Every component is a Svelte file with full props and children support.
- Support custom colors, spacing, and content via Tailwind utility classes or props.

### Sample Prompts
\`\`\`prompt
 Create a hero section using \`@sv/cnblocks\` with a compelling title, subheading, CTA, and image.
\`\`\`

\`\`\`prompt
 Create a Marketing page which include Hero in Notion Mist Style, Content,\n Feature, CTA and Footer with Responsive UI and Notion style theme using \`@sv/cnblocks\` from \`jsrepo\`
\`\`\``,
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
		code: `npm install -g jsrepo \n# Run MCP Server\njsrepo mcp`,
		lang: 'bash'
	});

	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_11);

	var div_14 = $.sibling(div_11, 2);
	var div_15 = $.sibling($.child(div_14), 2);
	var div_16 = $.child(div_15);
	var node_11 = $.sibling($.child(div_16), 4);

	DocsCodeBlock(node_11, {
		fileName: 'Terminal',
		code: `{
  "$schema": "https://unpkg.com/jsrepo@1.47.0/schemas/project-config.json",
  "repos": [
    "github/sikandarjodd/cnblocks"
  ],
  "includeTests": false,
  "watermark": true,
  "configFiles": {},
  "paths": {
    "*": "$lib/components/blocks",
    "mist": "$lib/components/mist",
    "magic": "$lib/components/magic",
    "ui": "$lib/components/ui",
    "hooks": "$lib/hooks",
    "utils": "$lib/utils"
  }
}`,
		lang: 'json'
	});

	$.reset(div_16);
	$.reset(div_15);
	$.reset(div_14);

	var div_17 = $.sibling(div_14, 2);
	var div_18 = $.sibling($.child(div_17), 2);
	var div_19 = $.child(div_18);
	var node_12 = $.sibling($.child(div_19), 2);

	DocsCodeBlock(node_12, {
		fileName: 'Terminal',
		code: `Hey can you create a Notion Style Landing page using \`jsrepo\` and using \`@sv/cnblocks\` \nwhich should include Hero Four, \nContent Setion, Feature Section, Footer\nrelated to Image as service with good Content and Images.\nUse images from Unsplash related to SASS Product.`,
		lang: 'bash'
	});

	$.reset(div_19);
	$.reset(div_18);
	$.reset(div_17);
	$.reset(div_1);
	$.reset(main);
	$.append($$anchor, main);
}