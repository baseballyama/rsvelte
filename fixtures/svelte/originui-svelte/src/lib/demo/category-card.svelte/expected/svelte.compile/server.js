import * as $ from 'svelte/internal/server';

export default function Category_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { alt, details, slug } = $$props;

		const images = import.meta.glob(['/src/lib/assets/thumbs/*.png'], {
			eager: true,
			import: 'default',
			query: { enhanced: true, w: '1280;640;400' }
		});

		function getImage(category) {
			const darkVersion = images[`/src/lib/assets/thumbs/${category}-dark.png`];
			const lightVersion = images[`/src/lib/assets/thumbs/${category}.png`];

			if (!darkVersion || !lightVersion) {
				throw new Error(`No image found for ${category}`);
			}

			return { dark: darkVersion, light: lightVersion };
		}

		const imageBasePath = $.derived(() => getImage(slug));

		$$renderer.push(`<div class="flex flex-col items-center justify-center space-y-3 text-center"><a${$.attr('href', `/${$.stringify(slug)}`)} class="dark:outline-svelte-700/80 group peer outline-svelte/40 relative grid place-items-center overflow-hidden rounded-xl outline-[0.5px] outline-solid sm:flex"${$.attr('tabindex', -1)}><enhanced:img class="h-[198px] w-[268px] object-cover dark:hidden"${$.attr('src', imageBasePath().light)}${$.attr('alt', alt)} loading="eager" fetchpriority="high" sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"></enhanced:img> <enhanced:img class="hidden h-[198px] w-[268px] object-cover dark:block"${$.attr('src', imageBasePath().dark)}${$.attr('alt', alt)} loading="eager" fetchpriority="high" sizes="(min-width:1920px) 1280px, (min-width:1080px) 640px, (min-width:768px) 400px"></enhanced:img> <span class="sr-only">${$.escape(alt)}</span> <div class="bg-svelte/60 group-hover:bg-svelte/80 absolute inset-0 mix-blend-overlay transition-colors"></div></a> <div class="mb-0.5 [&amp;_a]:peer-hover:underline">`);
		details($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}