import * as $ from 'svelte/internal/server';
import { VirtualMasonry, Heading, P } from "$lib";
import { Spinner } from "flowbite-svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		// Track if images are loaded (for client-side navigation)
		let imagesLoaded = false;

		function getImageHeight(image, _index) {
			const estimatedColumnWidth = 300;

			// Add extra height for padding
			const imageHeight = image.height / image.width * estimatedColumnWidth;

			return imageHeight + 16; // Add 16px for padding (p-2 = 8px top + 8px bottom)
		}

		$$renderer.push(`<div class="container mx-auto max-w-5xl px-4 py-8">`);

		Heading($$renderer, {
			tag: 'h1',
			class: 'mb-6 text-3xl font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Virtual Masonry Image Gallery (50 images)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->A virtualized Svelte component rendering an efficient masonry/Pinterest layout. It calculates item positions and uses windowing (overscan) to display only visible items from a large dataset,
    optimizing performance.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (!imagesLoaded || data.images.length === 0) {
			$$renderer.push(`<!--[0--><div class="flex h-96 items-center justify-center">`);
			Spinner($$renderer, { size: '12' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			{
				function children($$renderer, image, _index) {
					$$renderer.push(`<div class="group relative h-full"><img${$.attr('src', image.url)}${$.attr('alt', image.alt)} class="h-full w-full object-cover transition-opacity duration-500" loading="lazy" decoding="async"/> <div class="absolute right-0 bottom-0 left-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100"><p class="truncate text-sm font-medium">Photo by ${$.escape(image.author)}</p></div></div>`);
				}

				VirtualMasonry($$renderer, {
					items: data.images,
					columns: 2,
					gap: 16,
					height: 800,
					overscan: 200,
					getItemHeight: getImageHeight,
					classes: { item: "p-2" },
					children,
					$$slots: { default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div>`);
	});
}