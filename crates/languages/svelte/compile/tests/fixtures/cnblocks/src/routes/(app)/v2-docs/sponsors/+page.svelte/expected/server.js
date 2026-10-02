import * as $ from 'svelte/internal/server';
import SEOComponent from "$lib/seo/SEO.svelte";
import DocsPageShell from "$lib/components/layout/DocsPageShell.svelte";
import { H2, H3, Paragraph, Link, UnorderedList, ListItem } from "$lib/components/markdown/index";
import { docsV2PageMap } from "$lib/config/docs-v2";
import Button from "$lib/components/ui/button/button.svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const pageMeta = docsV2PageMap.sponsors;

		const sponsors = [
			{
				name: "Hunter Johnston",
				avatar: "https://github.com/huntabyte.png",
				href: "https://github.com/huntabyte"
			},

			{
				name: "Yashash Pugalia",
				avatar: "https://avatars.githubusercontent.com/u/89068816?v=4",
				href: "https://github.com/yashash-pugalia"
			},

			{
				name: "Ever",
				avatar: "https://avatars.githubusercontent.com/u/29817086?v=4",
				href: "https://github.com/ruizdiazever"
			}
		];

		SEOComponent($$renderer, {
			title: pageMeta.seo.title,
			description: pageMeta.seo.description,
			keywords: pageMeta.seo.keywords
		});

		$$renderer.push(`<!----> `);

		DocsPageShell($$renderer, {
			title: 'Sponsors',
			description: 'Support development of Svelte Shadcn Blocks and help keep the project sustainable.',
			children: ($$renderer) => {
				$$renderer.push(`<section>`);

				H2($$renderer, {
					id: 'current-sponsors',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Current Sponsors`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-2 grid grid-cols-2 gap-4 md:grid-cols-5"><!--[-->`);

				const each_array = $.ensure_array_like(sponsors);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let sponsor = each_array[$$index];

					$$renderer.push(`<a${$.attr('href', sponsor.href)} target="_blank" rel="noopener noreferrer" class="flex flex-col items-center justify-center rounded-xl border bg-card p-3"><img class="size-24 rounded-full border object-cover"${$.attr('src', sponsor.avatar)}${$.attr('alt', sponsor.name)} loading="lazy"/> <span class="mt-2 text-center text-sm font-medium">${$.escape(sponsor.name)}</span></a>`);
				}

				$$renderer.push(`<!--]--></div></section> <section>`);

				H2($$renderer, {
					id: 'how-to-support',
					children: ($$renderer) => {
						$$renderer.push(`<!---->How To Support`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				UnorderedList($$renderer, {
					class: 'mt-2',
					children: ($$renderer) => {
						ListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Become a recurring sponsor on GitHub.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Share the project with your developer network.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ListItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Contribute docs, bug fixes, and component improvements.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-6 flex flex-wrap gap-3">`);

				Button($$renderer, {
					href: 'https://github.com/sponsors/SikandarJODD',
					target: '_blank',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Donate on GitHub`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'outline',
					target: '_blank',
					href: 'https://twitter.com/intent/tweet?text=I%E2%80%99m%20using%20Svelte%20Shadcn%20Blocks%20for%20my%20marketing%20pages.%20Check%20it%20out%20https%3A%2F%2Fsv-blocks.vercel.app',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Share on Twitter`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></section>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}