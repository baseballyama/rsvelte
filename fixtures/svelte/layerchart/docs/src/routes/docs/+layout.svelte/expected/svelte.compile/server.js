import * as $ from 'svelte/internal/server';
import { Button, Drawer, MenuButton, ThemeSelect, Tooltip } from 'svelte-ux';
import { cls } from '@layerstack/tailwind';
import { page } from '$app/state';
import { examples } from '@layerstack/docs/context';
import { quickLinks } from '$lib/searchQuickLinks';
import DocsMenu from '$lib/components/DocsMenu.svelte';
import { Search, TableOfContents } from '@layerstack/docs/components';
import LucideAlignLeft from '~icons/lucide/align-left';
import LucideFilePen from '~icons/lucide/file-pen';
import LucideEllipsisVertical from '~icons/lucide/ellipsis-vertical';
import LucideArrowUpRight from '~icons/lucide/arrow-up-right';
import LucidePanelLeftOpen from '~icons/lucide/panel-left-open';
import LucidePanelLeftClose from '~icons/lucide/panel-left-close';
import LucideGithub from '~icons/lucide/github';
import CustomBluesky from '~icons/custom-brands/bluesky';
import CustomDiscord from '~icons/custom-brands/discord';
import Logo from '$lib/components/Logo.svelte';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;

		// Set examples context for all /docs pages
		// Child layouts (like docs/components/[name]) can override with merged data
		const examplesContext = {
			get current() {
				return data.examples;
			}
		};

		examples.set(examplesContext);

		// let pageContent = $derived(page.data.content.docs[page.params.slug] ?? {});
		let showDrawer = false;

		let showSidebar = true;
		const GITHUB_BLOB_URL = 'https://github.com/techniq/layerchart/blob/main/docs';

		/** Source markdown of the current page, if it has one (`null` for pages such as `/docs/releases`) */
		let editUrl = $.derived(() => {
			if (page.data.meta?.hideEditLink) return null;

			// Content collection pages (`/docs/{components,guides,utils}/...` sourced from `src/content`)
			const collection = page.url.pathname.split('/')[2];

			const filePath = page.data.metadata?._meta?.filePath;

			if (filePath && ['components', 'guides', 'utils'].includes(collection)) {
				return `${GITHUB_BLOB_URL}/src/content/${collection}/${filePath}`;
			}

			// Standalone markdown pages colocated with their route (e.g. `/docs/getting-started`)
			if (page.data.markdownPath) {
				return `${GITHUB_BLOB_URL}${page.data.markdownPath}`;
			}

			return null;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="absolute top-0 w-screen h-screen background-gradient pointer-events-none"></div> <div class="absolute top-0 w-screen h-screen background-grid pointer-events-none mask-b-to-50% mask-x-from-50%"></div> <header${$.attr_class($.clsx(cls('sticky top-0 z-30 flex h-16 items-center border-b border-primary/10 px-4 py-2', 'bg-radial from-black/0 from-[1px] to-surface-100/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg')))}>`);

			Button($$renderer, {
				icon: LucidePanelLeftOpen,
				onclick: () => showDrawer = true,
				class: 'mr-2 lg:hidden'
			});

			$$renderer.push(`<!----> <a href="/" class="flex items-center gap-3 text-xl font-bold lg:w-60">`);
			Logo($$renderer, { class: 'w-7 max-lg:hidden' });
			$$renderer.push(`<!----> LayerChart</a> <div class="grow text-end max-lg:ml-10 sm:text-start">`);
			Search($$renderer, { showExampleScreenshots: true, defaultOptions: quickLinks });
			$$renderer.push(`<!----></div> <div class="flex items-center gap-2"><div class="flex items-center border-r pr-2">`);
			ThemeSelect($$renderer, { keyboardShortcuts: true });
			$$renderer.push(`<!----></div> <div class="hidden md:flex">`);

			Tooltip($$renderer, {
				title: 'Discord',
				placement: 'left',
				offset: 2,
				children: ($$renderer) => {
					Button($$renderer, {
						icon: CustomDiscord,
						href: 'https://discord.gg/697JhMPD3t',
						class: 'p-2',
						target: '_blank'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'Bluesky',
				placement: 'left',
				offset: 2,
				children: ($$renderer) => {
					Button($$renderer, {
						icon: CustomBluesky,
						href: 'https://bsky.app/profile/techniq.dev',
						class: 'p-2',
						target: '_blank'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Tooltip($$renderer, {
				title: 'View repository',
				placement: 'left',
				offset: 2,
				children: ($$renderer) => {
					Button($$renderer, {
						icon: LucideGithub,
						href: 'https://github.com/techniq/layerchart',
						class: 'p-2',
						target: '_blank'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			MenuButton($$renderer, {
				icon: LucideEllipsisVertical,
				menuIcon: null,
				iconOnly: true,
				options: [
					{
						label: 'Svelte UX',
						value: 'https://svelte-ux.techniq.dev',
						icon: LucideArrowUpRight
					},

					{
						label: 'Github',
						value: 'https://github.com/techniq/layerchart',
						icon: LucideGithub
					},

					{
						label: 'Discord',
						value: 'https://discord.gg/697JhMPD3t',
						icon: CustomDiscord
					},

					{
						label: 'Bluesky',
						value: 'https://bsky.app/profile/techniq.dev',
						icon: CustomBluesky
					}
				],
				class: 'inline-block md:hidden',
				$$slots: {
					selection: ($$renderer) => {
						$$renderer.push(`<span slot="selection" class="hidden"></span>`);
					}
				}
			});

			$$renderer.push(`<!----></div></header> <div class="bg-surface-200 flex min-h-[calc(100vh-64px)]"><aside${$.attr_class($.clsx(cls('bg-surface-300/30 sticky top-16 hidden max-h-[calc(100dvh-64px)] border-r border-primary/10 transition-[width]', 'lg:grid lg:grid-rows-[1fr_56px]', showSidebar ? 'w-62' : 'w-0')))}><div class="overflow-auto" data-sveltekit-preserve-scroll="">`);
			DocsMenu($$renderer, { class: 'px-3 py-4' });
			$$renderer.push(`<!----></div> <div class="relative border-t border-primary/10">`);

			Button($$renderer, {
				onclick: () => showSidebar = !showSidebar,
				iconOnly: true,
				class: cls('absolute max-lg:hidden transition-[left] bottom-3', showSidebar ? 'left-50' : 'left-1'),
				children: ($$renderer) => {
					if (showSidebar) {
						$$renderer.push('<!--[0-->');
						LucidePanelLeftClose($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
						LucidePanelLeftOpen($$renderer, {});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></aside> `);

			Drawer($$renderer, {
				placement: 'left',
				class: 'bg-surface-200 w-60 border-r px-4 py-8',
				classes: { backdrop: 'bg-surface-100/20 backdrop-blur-sm' },
				get open() {
					return showDrawer;
				},

				set open($$value) {
					showDrawer = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					DocsMenu($$renderer, { onItemClick: () => showDrawer = false });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <main${$.attr_class($.clsx(cls('flex-1 min-w-0', page.data.meta?.fullWidth ? '' : 'px-6 py-4 lg:px-20 lg:py-8')))}>`);
			children($$renderer);
			$$renderer.push(`<!----> `);

			if (editUrl()) {
				$$renderer.push(`<!--[0--><div><a${$.attr('href', editUrl())} class="text-surface-content/50 hover:text-surface-content mb-4 mt-16 inline-flex items-center gap-1 text-sm" target="_blank">`);
				LucideFilePen($$renderer, { class: 'inline-block h-4 w-4' });
				$$renderer.push(`<!----> Edit this page</a></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="flex gap-4"></div></main> `);

			if (page.data.metadata?.toc?.length) {
				$$renderer.push(`<!--[0--><div class="sticky top-16 hidden max-h-[calc(100dvh-64px)] w-70 overflow-auto py-5 pr-6 xl:block"><div class="text-surface-content/50 flex items-center gap-2 pb-3 text-xs font-medium uppercase tracking-widest">`);
				LucideAlignLeft($$renderer, {});
				$$renderer.push(`<!----> On this page</div> <!---->`);

				{
					TableOfContents($$renderer, { items: page.data.metadata.toc });
				}

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}