import * as $ from 'svelte/internal/server';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, Paragraph, Strong, Table, Thead, Tbody, Tr, Th, Td, Link } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pageMeta = docsV2PageMap.introduction;

		SEOComponent($$renderer, {
			title: pageMeta.seo.title,
			description: pageMeta.seo.description,
			keywords: pageMeta.seo.keywords
		});

		$$renderer.push(`<!----> `);

		DocsPageShell($$renderer, {
			title: 'Introduction',
			description: 'Everything you need to start using Svelte Shadcn Blocks.',
			children: ($$renderer) => {
				$$renderer.push(`<section>`);

				H2($$renderer, {
					id: 'overview',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Overview`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Svelte Shadcn Blocks ships production-ready UI blocks built with `);

						Strong($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Svelte 5`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->, Shadcn-Svelte and Tailwind CSS`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></section> <section class="space-y-4">`);

				H2($$renderer, {
					id: 'variants',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Available Variants`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Table($$renderer, {
					children: ($$renderer) => {
						Thead($$renderer, {
							children: ($$renderer) => {
								Tr($$renderer, {
									children: ($$renderer) => {
										Th($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Variant`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Th($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Style`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Th($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Best For`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Tbody($$renderer, {
							children: ($$renderer) => {
								Tr($$renderer, {
									children: ($$renderer) => {
										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Normal`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Bold marketing visuals`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Landing pages and campaigns`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Tr($$renderer, {
									children: ($$renderer) => {
										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Mist`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Minimal and documentation friendly`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Content-heavy product websites`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Tr($$renderer, {
									children: ($$renderer) => {
										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Veil`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Polished modern SaaS look`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Startup and product pages`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></section> <section>`);

				H2($$renderer, {
					id: 'quick-start',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Quick Start`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Paragraph($$renderer, {
					class: 'mt-1',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Start with `);

						Link($$renderer, {
							href: '/v2-docs/installation',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Installation`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> and continue with the theme
			setup that matches your project.`);
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