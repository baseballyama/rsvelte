import * as $ from 'svelte/internal/server';
import { Skeleton } from '$lib/components/ui/skeleton';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';

export default function Homepage_banners($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { bannersList = [] } = $$props;
		let loading = true;
		let loadedImages = new Set();

		const onImageLoad = (url) => {
			loadedImages.add(url);
		};

		$$renderer.push(`<div>`);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="space-y-12"><div>`);
			Skeleton($$renderer, { class: 'mx-auto mb-6 h-8 w-48 rounded-full' });
			$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-4">`);
			Skeleton($$renderer, { class: 'aspect-[4/5] w-full rounded-none md:aspect-video' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'aspect-[4/5] w-full rounded-none md:aspect-video' });
			$$renderer.push(`<!----></div></div></div>`);
		} else if (bannersList.length) {
			$$renderer.push(`<!--[1--><!--[-->`);

			const each_array = $.ensure_array_like(bannersList);

			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
				let { title, link, isActive, banners, itemsPerRow } = each_array[$$index_1];

				if (isActive) {
					$$renderer.push(`<!--[0--><div class="py-12">`);

					if (title) {
						$$renderer.push(`<!--[0--><div class="mb-10 flex flex-col items-center text-center"><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">${$.escape(title)}</h2> <div class="mt-4 h-1 w-12 bg-primary"></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div${$.attr_class(`grid grid-cols-${$.stringify(itemsPerRow)} gap-4 md:gap-8`)}>`);

					if (banners.length) {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array_1 = $.ensure_array_like(banners);

						for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
							let banner = each_array_1[$$index];

							$$renderer.push(`<a${$.attr('href', banner.link || link)}${$.attr('aria-label', banner.title || banner.link)} class="group relative block w-full overflow-hidden rounded-none shadow-sm transition-all duration-500 hover:shadow-xl"><div class="relative overflow-hidden">`);

							LazyImg($$renderer, {
								src: banner.url,
								alt: banner.title || banner.link,
								aspectRatio: itemsPerRow === 1 ? '21:9' : '1:1',
								class: 'relative w-full'
							});

							$$renderer.push(`<!----> <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">`);

							if (banner.title) {
								$$renderer.push(`<!--[0--><div class="absolute bottom-6 left-6 text-white"><h3 class="text-xl font-bold">${$.escape(banner.title)}</h3> <p class="mt-1 text-sm font-medium text-white/80">Explore Collection</p></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div></div></a>`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}