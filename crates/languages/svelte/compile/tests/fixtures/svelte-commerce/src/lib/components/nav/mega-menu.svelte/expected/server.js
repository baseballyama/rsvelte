import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { MegaMenuRenderer } from '$lib/core/composables/index.js';
import { getImageCDNUrl } from '$lib/core/utils/index.js';
import { page } from '$app/state';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
import { fade } from 'svelte/transition';
import { onMount } from 'svelte';

export default function Mega_menu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Slim variant for the scrolled header: drops the menu list's vertical padding.
		// (jws also dropped the list's margin and border here; this list carries neither.)
		let { slim = false } = $$props;

		// Admin-configured header menu takes priority over the raw category megamenu.
		// Menu-builder nodes keep their children under `items`; category nodes use `children`.
		const headerMenuItems = $.derived(() => page.data.store?.menu?.find((x) => x.menuId === 'header')?.items);

		// The renderer doesn't expose loading state, so settle the same megamenu promise here
		// to tell "still loading" (skeleton) apart from "loaded but empty" (empty nav).
		let megamenuSettled = false;

		onMount(() => {
			Promise.resolve(page?.data?.store?.megamenu).catch(() => {}).finally(() => megamenuSettled = true);
		});

		function childrenOf(node) {
			return node?.items ?? node?.children;
		}

		function sortByRank(nodes) {
			return nodes?.toSorted((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
		}

		function getThumbnailURL(x, width) {
			if (page?.data?.store?.plugins?.imageCdn?.active) return getImageCDNUrl(x, width);

			return x;
		}

		{
			function content(
				$$renderer,
				{
					toggleMenuItemChildren,
					selectedCategory,
					openChildMenu,
					closeChildMenu
				}
			) {
				const items = headerMenuItems() ?? [];

				if (items?.length) {
					$$renderer.push(`<!--[0--><ul class="intra-gap flex max-w-[65vw] flex-row items-center justify-evenly overflow-x-auto scrollbar-none"><!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let category = each_array[index];

						$$renderer.push(`<li class="hoverable svelte-1w8y9gc"><a${$.attr('aria-haspopup', childrenOf(category)?.length ? 'true' : undefined)}${$.attr('aria-expanded', childrenOf(category)?.length ? !!toggleMenuItemChildren[index] : undefined)}${$.attr('href', category.link || '/' + category.slug)}${$.attr_class(`ed-mm-link relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap ${slim ? 'py-1.5' : 'py-3'} text-sm font-semibold uppercase text-gray-900 transition-all duration-300 hover:text-gray-900 active:scale-95 ${selectedCategory === category.name ? 'text-primary after:scale-x-100' : 'after:scale-x-0'} after:ease-out-expo after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100`)} style="font-family: var(--font-body);"><span>${$.escape(category.name)}</span> `);

						if (childrenOf(category)?.length) {
							$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"${$.attr_class(`ease-out-expo h-3.5 w-3.5 shrink-0 transition-transform duration-300 ${selectedCategory === category.name ? '-rotate-180 transform' : ''}`)}><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path></svg>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></a> `);

						if (toggleMenuItemChildren[index] && childrenOf(category)?.length) {
							$$renderer.push(`<!--[0--><div class="ed-mm-panel mega-menu ease-out-expo absolute left-1/2 top-full w-[90vw] max-w-screen-xl -translate-x-1/2 overflow-hidden rounded-b-xl border-x border-b border-gray-100 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 svelte-1w8y9gc"><div class="flex"><div class="grid max-h-[70vh] flex-1 grid-cols-4 gap-x-8 gap-y-2 overflow-y-auto px-10 py-7 scrollbar-thin"><!--[-->`);

							const each_array_1 = $.ensure_array_like(sortByRank(childrenOf(category)));

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let c = each_array_1[$$index_1];

								$$renderer.push(`<div class="flex flex-col gap-2"><a${$.attr('href', c.link || '/' + c.slug)} class="ed-mm-cat flex items-center gap-2 text-sm font-semibold text-gray-900 transition-all hover:translate-x-1">`);

								if (c?.thumbnail) {
									$$renderer.push(`<!--[0--><img${$.attr('src', getThumbnailURL(c.thumbnail, 40))}${$.attr('alt', c?.name)} loading="lazy" class="h-6 w-6 shrink-0 rounded-full object-cover" onerror="this.__e=event"/>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> ${$.escape(c.name)}</a> `);

								if (childrenOf(c)) {
									$$renderer.push(`<!--[0--><ul class="flex flex-col gap-1.5"><!--[-->`);

									const each_array_2 = $.ensure_array_like(sortByRank(childrenOf(c)));

									for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
										let c1 = each_array_2[$$index];

										$$renderer.push(`<li><a${$.attr('href', c1.link || '/' + c1.slug)} class="ed-mm-sub flex items-center gap-2 text-[13px] font-medium text-gray-700 transition-all hover:translate-x-1 hover:text-primary">`);

										if (c1?.thumbnail) {
											$$renderer.push(`<!--[0--><img${$.attr('src', getThumbnailURL(c1?.thumbnail, 40))}${$.attr('alt', c1?.name)} loading="lazy" class="h-8 w-8 shrink-0 rounded object-cover" onerror="this.__e=event"/>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> ${$.escape(c1.name)}</a></li>`);
									}

									$$renderer.push(`<!--]--></ul>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
							}

							$$renderer.push(`<!--]--></div> `);

							if (category?.thumbnail) {
								$$renderer.push(`<!--[0--><a${$.attr('href', category.link || '/' + category.slug)} class="hidden w-72 shrink-0 self-center p-6 lg:block">`);
								LazyImg($$renderer, { src: category.thumbnail, alt: category.name, class: '' });
								$$renderer.push(`<!----></a>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div> <div class="ed-mm-foot border-t border-gray-100 bg-gray-50 px-10 py-4"><a${$.attr('href', category.link || '/' + category.slug)} class="ed-mm-viewall text-xs font-semibold text-muted-foreground transition-colors">View all ${$.escape(category.name)}</a></div></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				} else if (headerMenuItems() === undefined && !megamenuSettled) {
					$$renderer.push(`<!--[1--><ul class="intra-gap flex max-w-[65vw] flex-row items-center justify-evenly overflow-x-auto scrollbar-none"><!--[-->`);

					const each_array_3 = $.ensure_array_like(Array(6));

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let _ = each_array_3[$$index_3];

						$$renderer.push(`<li${$.attr_class($.clsx(slim ? 'py-1.5' : 'py-3'))}>`);
						Skeleton($$renderer, { class: 'h-5 w-24 rounded-full' });
						$$renderer.push(`<!----></li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			MegaMenuRenderer($$renderer, { content, $$slots: { content: true } });
		}
	});
}