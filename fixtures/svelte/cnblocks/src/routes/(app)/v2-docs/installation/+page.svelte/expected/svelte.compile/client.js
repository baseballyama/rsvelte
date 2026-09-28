import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, Paragraph, Steps, Step, Link } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

var root = $.from_html(
	`Open any preview route, copy the component code, and paste it into your app.
					Start with <!>, <!>, or <!>.`,
	1
);

var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<section class="space-y-4"><!> <!></section>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const pageMeta = docsV2PageMap.installation;
	var fragment = root_3();
	var node = $.first_child(fragment);

	SEOComponent(node, {
		get title() {
			return pageMeta.seo.title;
		},

		get description() {
			return pageMeta.seo.description;
		},

		get keywords() {
			return pageMeta.seo.keywords;
		}
	});

	var node_1 = $.sibling(node, 2);

	DocsPageShell(node_1, {
		title: 'Installation',
		description: 'Install and configure Svelte Shadcn Blocks in a new or existing SvelteKit app.',
		children: ($$anchor, $$slotProps) => {
			var section = root_2();
			var node_2 = $.child(section);

			H2(node_2, {
				id: 'steps',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Setup Steps');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Steps(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_4 = $.first_child(fragment_1);

					Step(node_4, {
						title: 'Create or open a sveltekit project',
						children: ($$anchor, $$slotProps) => {
							DocsCodeBlock($$anchor, {
								fileName: 'Terminal',
								code: 'pnpm dlx sv create my-app',
								lang: 'bash'
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Step(node_5, {
						title: 'Add Tailwind CSS',
						children: ($$anchor, $$slotProps) => {
							DocsCodeBlock($$anchor, {
								fileName: 'Terminal',
								code: 'pnpm dlx sv add tailwindcss',
								lang: 'bash'
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Step(node_6, {
						title: 'Initialize shadcn-svelte',
						children: ($$anchor, $$slotProps) => {
							DocsCodeBlock($$anchor, {
								fileName: 'Terminal',
								code: 'pnpm dlx shadcn-svelte@latest init',
								lang: 'bash'
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Step(node_7, {
						title: 'Install block using shadcn-svelte CLI',
						children: ($$anchor, $$slotProps) => {
							DocsCodeBlock($$anchor, {
								fileName: 'Terminal',
								code: `pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/r/hero-one.json
pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/m/hero-one.json
pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/v/hero-one.json`,
								lang: 'bash'
							});
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Step(node_8, {
						title: 'Or simply copy and paste components',
						children: ($$anchor, $$slotProps) => {
							Paragraph($$anchor, {
								class: 'mt-0',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_7 = root();
									var node_9 = $.sibling($.first_child(fragment_7));

									Link(node_9, {
										href: '/preview/hero/one',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Hero Block');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Link(node_10, {
										href: '/preview/mist/hero/one',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Mist');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									Link(node_11, {
										href: '/preview/veil/hero/hero-one',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Veil');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(section);
			$.append($$anchor, section);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}