import * as $ from 'svelte/internal/server';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, Paragraph, Steps, Step, Link } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import DocsCodeBlock from "$lib/web/docs/DocsCodeBlock.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pageMeta = docsV2PageMap.installation;

		SEOComponent($$renderer, {
			title: pageMeta.seo.title,
			description: pageMeta.seo.description,
			keywords: pageMeta.seo.keywords
		});

		$$renderer.push(`<!----> `);

		DocsPageShell($$renderer, {
			title: 'Installation',
			description: 'Install and configure Svelte Shadcn Blocks in a new or existing SvelteKit app.',
			children: ($$renderer) => {
				$$renderer.push(`<section class="space-y-4">`);

				H2($$renderer, {
					id: 'steps',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Setup Steps`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Steps($$renderer, {
					children: ($$renderer) => {
						Step($$renderer, {
							title: 'Create or open a sveltekit project',
							children: ($$renderer) => {
								DocsCodeBlock($$renderer, {
									fileName: 'Terminal',
									code: 'pnpm dlx sv create my-app',
									lang: 'bash'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							title: 'Add Tailwind CSS',
							children: ($$renderer) => {
								DocsCodeBlock($$renderer, {
									fileName: 'Terminal',
									code: 'pnpm dlx sv add tailwindcss',
									lang: 'bash'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							title: 'Initialize shadcn-svelte',
							children: ($$renderer) => {
								DocsCodeBlock($$renderer, {
									fileName: 'Terminal',
									code: 'pnpm dlx shadcn-svelte@latest init',
									lang: 'bash'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							title: 'Install block using shadcn-svelte CLI',
							children: ($$renderer) => {
								DocsCodeBlock($$renderer, {
									fileName: 'Terminal',
									code: `pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/r/hero-one.json
pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/m/hero-one.json
pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/v/hero-one.json`,
									lang: 'bash'
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Step($$renderer, {
							title: 'Or simply copy and paste components',
							children: ($$renderer) => {
								Paragraph($$renderer, {
									class: 'mt-0',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Open any preview route, copy the component code, and paste it into your app.
					Start with `);

										Link($$renderer, {
											href: '/preview/hero/one',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Hero Block`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->, `);

										Link($$renderer, {
											href: '/preview/mist/hero/one',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Mist`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->, or `);

										Link($$renderer, {
											href: '/preview/veil/hero/hero-one',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Veil`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->.`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></section>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}