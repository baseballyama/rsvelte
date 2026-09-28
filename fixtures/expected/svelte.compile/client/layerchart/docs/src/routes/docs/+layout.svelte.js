import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span slot="selection" class="hidden"></span>`);
var root_1 = $.from_html(`<div><a class="text-surface-content/50 hover:text-surface-content mb-4 mt-16 inline-flex items-center gap-1 text-sm" target="_blank"><!> Edit this page</a></div>`);
var root_2 = $.from_html(`<div class="sticky top-16 hidden max-h-[calc(100dvh-64px)] w-70 overflow-auto py-5 pr-6 xl:block"><div class="text-surface-content/50 flex items-center gap-2 pb-3 text-xs font-medium uppercase tracking-widest"><!> On this page</div> <!></div>`);
var root_3 = $.from_html(`<div class="absolute top-0 w-screen h-screen background-gradient pointer-events-none"></div> <div class="absolute top-0 w-screen h-screen background-grid pointer-events-none mask-b-to-50% mask-x-from-50%"></div> <header><!> <a href="/" class="flex items-center gap-3 text-xl font-bold lg:w-60"><!> LayerChart</a> <div class="grow text-end max-lg:ml-10 sm:text-start"><!></div> <div class="flex items-center gap-2"><div class="flex items-center border-r pr-2"><!></div> <div class="hidden md:flex"><!> <!> <!></div> <!></div></header> <div class="bg-surface-200 flex min-h-[calc(100vh-64px)]"><aside><div class="overflow-auto" data-sveltekit-preserve-scroll=""><!></div> <div class="relative border-t border-primary/10"><!></div></aside> <!> <main><!> <!> <div class="flex gap-4"></div></main> <!></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	// Set examples context for all /docs pages
	// Child layouts (like docs/components/[name]) can override with merged data
	const examplesContext = {
		get current() {
			return $$props.data.examples;
		}
	};

	examples.set(examplesContext);

	// let pageContent = $derived(page.data.content.docs[page.params.slug] ?? {});
	let showDrawer = $.state(false);

	let showSidebar = $.state(true);
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

	var fragment = root_3();
	var header = $.sibling($.first_child(fragment), 4);
	var node = $.child(header);

	// dot background
	Button(node, {
		get icon() {
			return LucidePanelLeftOpen;
		},
		onclick: () => $.set(showDrawer, true),
		class: 'mr-2 lg:hidden'
	});

	var a = $.sibling(node, 2);
	var node_1 = $.child(a);

	Logo(node_1, { class: 'w-7 max-lg:hidden' });
	$.next();
	$.reset(a);

	var div = $.sibling(a, 2);
	var node_2 = $.child(div);

	Search(node_2, {
		showExampleScreenshots: true,
		get defaultOptions() {
			return quickLinks;
		}
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var node_3 = $.child(div_2);

	ThemeSelect(node_3, { keyboardShortcuts: true });
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_4 = $.child(div_3);

	Tooltip(node_4, {
		title: 'Discord',
		placement: 'left',
		offset: 2,
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				get icon() {
					return CustomDiscord;
				},
				href: 'https://discord.gg/697JhMPD3t',
				class: 'p-2',
				target: '_blank'
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Tooltip(node_5, {
		title: 'Bluesky',
		placement: 'left',
		offset: 2,
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				get icon() {
					return CustomBluesky;
				},
				href: 'https://bsky.app/profile/techniq.dev',
				class: 'p-2',
				target: '_blank'
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Tooltip(node_6, {
		title: 'View repository',
		placement: 'left',
		offset: 2,
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				get icon() {
					return LucideGithub;
				},
				href: 'https://github.com/techniq/layerchart',
				class: 'p-2',
				target: '_blank'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var node_7 = $.sibling(div_3, 2);

	{
		let $0 = $.derived(() => [
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
		]);

		MenuButton(node_7, {
			get icon() {
				return LucideEllipsisVertical;
			},
			menuIcon: null,
			iconOnly: true,
			get options() {
				return $.get($0);
			},
			class: 'inline-block md:hidden',
			$$events: {
				change: (e) => {
					window.open(e.detail.value, '_blank');
				}
			},
			$$slots: {
				selection: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				}
			}
		});
	}

	$.reset(div_1);
	$.reset(header);

	var div_4 = $.sibling(header, 2);
	var aside = $.child(div_4);
	var div_5 = $.child(aside);
	var node_8 = $.child(div_5);

	DocsMenu(node_8, { class: 'px-3 py-4' });
	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_9 = $.child(div_6);

	{
		let $0 = $.derived(() => cls('absolute max-lg:hidden transition-[left] bottom-3', $.get(showSidebar) ? 'left-50' : 'left-1'));

		Button(node_9, {
			onclick: () => $.set(showSidebar, !$.get(showSidebar)),
			iconOnly: true,
			get class() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_10 = $.first_child(fragment_4);

				{
					var consequent = ($$anchor) => {
						LucidePanelLeftClose($$anchor, {});
					};

					var alternate = ($$anchor) => {
						LucidePanelLeftOpen($$anchor, {});
					};

					$.if(node_10, ($$render) => {
						if ($.get(showSidebar)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_6);
	$.reset(aside);

	var node_11 = $.sibling(aside, 2);

	Drawer(node_11, {
		placement: 'left',
		class: 'bg-surface-200 w-60 border-r px-4 py-8',
		classes: { backdrop: 'bg-surface-100/20 backdrop-blur-sm' },
		get open() {
			return $.get(showDrawer);
		},

		set open($$value) {
			$.set(showDrawer, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			DocsMenu($$anchor, { onItemClick: () => $.set(showDrawer, false) });
		},
		$$slots: { default: true }
	});

	var main = $.sibling(node_11, 2);
	var node_12 = $.child(main);

	$.snippet(node_12, () => $$props.children);

	var node_13 = $.sibling(node_12, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_7 = root_1();
			var a_1 = $.child(div_7);
			var node_14 = $.child(a_1);

			LucideFilePen(node_14, { class: 'inline-block h-4 w-4' });
			$.next();
			$.reset(a_1);
			$.reset(div_7);
			$.template_effect(() => $.set_attribute(a_1, 'href', $.get(editUrl)));
			$.append($$anchor, div_7);
		};

		$.if(node_13, ($$render) => {
			if ($.get(editUrl)) $$render(consequent_1);
		});
	}

	$.next(2);
	$.reset(main);

	var node_15 = $.sibling(main, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_8 = root_2();
			var div_9 = $.child(div_8);
			var node_16 = $.child(div_9);

			LucideAlignLeft(node_16, {});
			$.next();
			$.reset(div_9);

			var node_17 = $.sibling(div_9, 2);

			$.key(node_17, () => page.url, ($$anchor) => {
				TableOfContents($$anchor, {
					get items() {
						return page.data.metadata.toc;
					}
				});
			});

			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_15, ($$render) => {
			if (page.data.metadata?.toc?.length) $$render(consequent_2);
		});
	}

	$.reset(div_4);

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(header, 1, $0);
			$.set_class(aside, 1, $1);
			$.set_class(main, 1, $2);
		},
		[
			() => $.clsx(cls('sticky top-0 z-30 flex h-16 items-center border-b border-primary/10 px-4 py-2', 'bg-radial from-black/0 from-[1px] to-surface-100/90 to-[1px] bg-size-[6px_6px] backdrop-blur-lg')),
			() => $.clsx(cls('bg-surface-300/30 sticky top-16 hidden max-h-[calc(100dvh-64px)] border-r border-primary/10 transition-[width]', 'lg:grid lg:grid-rows-[1fr_56px]', $.get(showSidebar) ? 'w-62' : 'w-0')),
			() => $.clsx(cls('flex-1 min-w-0', page.data.meta?.fullWidth ? '' : 'px-6 py-4 lg:px-20 lg:py-8'))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}