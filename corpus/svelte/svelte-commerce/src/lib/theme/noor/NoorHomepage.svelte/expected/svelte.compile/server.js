import * as $ from 'svelte/internal/server';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import ThemeSections from '../ThemeSections.svelte';

export default function NoorHomepage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Noor homepage — the bundled fallback for the theme's section layout.
		 *
		 * Noor renders from `store.themeLayout` (served by the API) when that is present. When it is
		 * NOT — a brand-new store, a Medusa/Shopify backend, or an API hiccup — the homepage route
		 * used to fall back to `themeHomepages['default']`, i.e. the Refined Editorial homepage
		 * (Bodoni serif, cream canvas, its own hero and assurance copy) sandwiched between the noor
		 * header and the noor footer. This component is noor's own guaranteed homepage instead: the
		 * same section library, driven by a layout bundled with the build.
		 */
		let {
			themeContent,
			brandName,
			currencyCode,
			aspectWidth,
			aspectHeight,
			featuredCategories = [],
			featuredProducts = [],
			loading = false
		} = $$props;

		/**
		 * Section order and settings. Every string is a content path resolved against the store's
		 * theme content, so nothing here is hardcoded copy; live products/categories come from the
		 * props above.
		 */
		const noorLayout = {
			rootClass: 'noor-home',
			sections: [
				{
					type: 'banner',
					options: {
						image: 'hero.image',
						alt: 'hero.imageAlt',
						class: 'noor-hero',
						aspect: '16/9',
						priority: true,
						href: '/products'
					}
				},

				{
					type: 'tile-grid',
					options: {
						source: 'tiles.categories',
						liveCategories: true,
						limit: 6,
						caption: 'below',
						class: 'noor-section noor-categories',
						gridClass: 'noor-tile-row',
						tileClass: 'noor-tile',
						heading: {
							label: 'category.label',
							title: 'category.titleLead',
							titleSuffix: 'category.titleAccent',
							text: 'category.text'
						}
					}
				},

				{
					type: 'product-grid',
					options: {
						limit: 8,
						class: 'noor-section noor-products',
						gridClass: 'noor-product-row',
						heading: {
							label: 'menu.label',
							title: 'menu.titleLead',
							titleSuffix: 'menu.titleAccent',
							cta: 'menu.cta',
							ctaHref: '/products'
						},
						empty: { title: 'menu.emptyTitle', text: 'menu.emptyText' }
					}
				},

				{
					type: 'banner',
					options: {
						image: 'special.image',
						alt: 'special.imageAlt',
						class: 'noor-campaign',
						aspect: '21/9'
					}
				},

				{
					type: 'newsletter',
					options: {
						class: 'noor-section noor-newsletter',
						label: 'newsletter.label',
						title: 'newsletter.titleLead',
						titleSuffix: 'newsletter.titleAccent',
						text: 'newsletter.text',
						placeholder: 'newsletter.placeholder',
						cta: 'newsletter.cta',
						privacy: 'newsletter.privacy'
					}
				}
			]
		};

		const ctx = $.derived(() => ({
			content: themeContent,
			brandName,
			currencyCode,
			aspectWidth,
			aspectHeight,
			featuredProducts,
			featuredCategories,
			loading,
			ProductCard
		}));

		// The section library only ever emits <h2>, so a section-driven homepage has no top-level
		// heading. The hero is artwork, so this one is visually hidden.
		const pageTitle = $.derived(() => [
			themeContent?.hero?.titleLead,
			themeContent?.hero?.titleAccent
		].filter(Boolean).join(' ') || brandName);

		$$renderer.push(`<div class="noor-homepage svelte-1rmt1pq"><h1 class="sr-only">${$.escape(pageTitle())}</h1> `);
		ThemeSections($$renderer, { layout: noorLayout, ctx: ctx() });
		$$renderer.push(`<!----></div>`);
	});
}