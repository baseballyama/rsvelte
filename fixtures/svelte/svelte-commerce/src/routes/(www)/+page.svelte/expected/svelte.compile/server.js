import * as $ from 'svelte/internal/server';
import { page as sveltePage } from '$app/state';
import { fly } from 'svelte/transition';
import { X } from '@lucide/svelte';
import { Button } from '$lib/components/ui/button';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import StructuredData from '$lib/components/seo/structured-data.svelte';
import ProductListSchema from '$lib/components/seo/product-list-schema.svelte';
import { cleanSchemaText } from '$lib/components/seo/schema.js';
import { HomepageModule } from '$lib/core/composables/index.js';
import { setCollectionState } from '$lib/core/stores/collection.svelte.js';
import { timestampToAgo } from '$lib/core/utils/index.js';
import { resolveThemeContent } from '$lib/theme/index.js';
import { themeHomepages } from '$lib/theme/homepages.js';
import ThemeSections from '$lib/theme/ThemeSections.svelte';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		// `url.origin` already carries the scheme — prefixing it with another `https://` produced
		// `https://https://example.com` and broke the WebSite -> Organization @id join.
		const origin = $.derived(() => sveltePage.url.origin);

		const $$d = $.derived(() => data?.store?.productImageAspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		setCollectionState();

		const page = data?.page || {};
		const homepageModule = new HomepageModule();
		const activeTheme = $.derived(() => data?.theme?.name || 'default');
		const ThemeHomepage = $.derived(() => themeHomepages[activeTheme()] || themeHomepages['default']);

		// Hardcoded theme content, with the store's admin-provided themeContent (store.theme.content)
		// merged over it section by section (falls back to the theme defaults for anything unset).
		const themeContent = $.derived(() => resolveThemeContent(activeTheme(), data?.store));

		// The store's own name wins; a theme's brandName is demo copy for previewing the theme.
		const brandName = $.derived(() => data?.store?.name || themeContent().brandName || 'Store');

		const themeDescription = $.derived(() => themeContent().description || page?.metaDescription || '');

		// Server data first, module second. `+page.ts` fetches both so they are in the SSR HTML;
		// HomepageModule then populates its own copies on the client and takes over once it has them
		// (it owns the load-more accumulator, so its list grows past this first page).
		const featuredCategories = $.derived(() => homepageModule.featuredCategories?.length
			? homepageModule.featuredCategories
			: data?.featuredCategories ?? []);

		const featuredProducts = $.derived(() => homepageModule.featuredProducts?.length
			? homepageModule.featuredProducts
			: data?.featuredProducts ?? []);

		// Section-driven themes ship their homepage as data (`themeLayout` from the API) and are
		// rendered with the shared section library. Themes that still have a bespoke component fall
		// back to it, so both kinds work side by side while themes are migrated.
		const themeLayout = $.derived(() => data?.store?.themeLayout);

		const sectionContext = $.derived(() => ({
			content: themeContent(),
			brandName: brandName(),
			currencyCode: data?.store?.currency?.code,
			aspectWidth: aspectWidth(),
			aspectHeight: aspectHeight(),
			featuredProducts: featuredProducts(),
			featuredCategories: featuredCategories(),
			loading: homepageModule.loading,
			ProductCard
		}));

		const filterButtons = $.derived(() => [
			'All',
			...featuredCategories().map((category) => category?.name || category?.title).filter(Boolean).slice(0, 6)
		]);

		// Organization JSON-LD, built here rather than via GoogleStructuredDataOrganization, whose
		// prop defaults hardcode `@type: ['Organization','JewelryStore']` and `priceRange: '$$$'` —
		// wrong for every non-jewellery store deployed from this white-label template, and not
		// overridable by passing `undefined` (that just re-selects the default).
		const organizationSchema = $.derived(() => {
			const store = data?.store;

			const social = store?.socialSharing?.active
				? Object.values(store?.socialSharing || {}).filter((link) => typeof link === 'string' && link.startsWith('http'))
				: [];

			if (!social.length) {
				const plugin = store?.plugins?.socialSharingButtons || {};

				for (const key in plugin) {
					if (key !== 'active' && plugin[key]) social.push(plugin[key]);
				}
			}

			const description = cleanSchemaText(themeDescription() || store?.description);
			const logo = data?.store?.logo;

			return {
				'@context': 'https://schema.org',
				// The store declares its own entity type; anything else would be a guess.
				'@type': store?.schemaType || 'Organization',
				'@id': `${origin()}/#organization`,
				name: brandName(),
				url: origin(),
				...logo ? { logo, image: logo } : {},
				...description ? { description } : {},
				...store?.priceRange ? { priceRange: store.priceRange } : {},
				address: store?.address
					? {
						'@type': 'PostalAddress',
						streetAddress: store?.address?.street,
						addressLocality: store?.address?.city,
						addressRegion: store?.address?.state,
						postalCode: store?.address?.pincode,
						addressCountry: store?.address?.country
					}
					: {
						'@type': 'PostalAddress',
						streetAddress: store?.address_1,
						addressLocality: store?.city,
						addressRegion: store?.state,
						postalCode: store?.zip,
						addressCountry: store?.country?.iso2
					},

				contactPoint: {
					'@type': 'ContactPoint',
					telephone: store?.contact?.phone || store?.businessPhone,
					email: store?.contact?.email || store?.businessEmail,
					contactType: 'customer service'
				},
				sameAs: social
			};
		});

		// WebSite JSON-LD. The core component's SearchAction points at `/products?search=`, which
		// this site's own robots.txt disallows (`Disallow: /*?*search=`) and the project's link
		// convention forbids; the canonical term route is the bare slug.
		const websiteSchema = $.derived(() => {
			const description = cleanSchemaText(data?.store?.description);

			return {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: data?.store?.name,
				...description ? { description } : {},
				url: origin(),
				publisher: { '@id': `${origin()}/#organization` },
				potentialAction: {
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: `${origin()}/{search_term_string}`
					},
					'query-input': 'required name=search_term_string'
				}
			};
		});

		ProductListSchema($$renderer, { products: featuredProducts() });
		$$renderer.push(`<!----> `);
		StructuredData($$renderer, { schema: organizationSchema() });
		$$renderer.push(`<!----> `);
		StructuredData($$renderer, { schema: websiteSchema() });
		$$renderer.push(`<!----> `);

		SeoHeader($$renderer, {
			metaTitle: themeContent().seoTitle || page?.metaTitle || brandName(),
			metaDescription: themeDescription(),
			metaKeywords: page?.metaKeywords,
			image: themeContent().seoImage || page?.logo || data?.store?.logo
		});

		$$renderer.push(`<!----> `);

		if (themeLayout()?.sections?.length) {
			$$renderer.push('<!--[0-->');
			ThemeSections($$renderer, { layout: themeLayout(), ctx: sectionContext() });
		} else {
			$$renderer.push('<!--[-1-->');

			if (ThemeHomepage()) {
				$$renderer.push('<!--[-->');

				ThemeHomepage()($$renderer, {
					themeContent: themeContent(),
					brandName: brandName(),
					themeDescription: themeDescription(),
					storeLogo: data?.store?.logo,
					storeName: data?.store?.name,
					storeDescription: data?.store?.description,
					aspectWidth: aspectWidth(),
					aspectHeight: aspectHeight(),
					featuredCategories: featuredCategories(),
					featuredProducts: featuredProducts(),
					filterButtons: filterButtons(),
					homepageModule,
					loading: homepageModule.loading,
					desktopBanners: page?.desktopBanners,
					tabletBanners: page?.tabletBanners,
					mobileBanners: page?.mobileBanners,
					pageSections: page?.sections,
					currencyCode: data?.store?.currency?.code
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--> `);

		if (homepageModule.showRecentOrderPopup) {
			$$renderer.push(`<!--[0--><div class="fixed bottom-20 right-4 z-50"><div class="flex max-w-[320px] gap-3 border-l-4 border-primary bg-white p-3.5 shadow-lg"><a${$.attr('href', `/products/${$.stringify(homepageModule.selectedRecentOrder?.slug || '')}`)} class="flex gap-3 text-foreground"><img${$.attr('src', homepageModule.selectedRecentOrder?.image || homepageModule.selectedRecentOrder?.img || homepageModule.selectedRecentOrder?.thumbnail)}${$.attr('alt', homepageModule.selectedRecentOrder?.title || 'Product')} class="h-[58px] w-[58px] object-cover"/> <div><p class="text-xs text-gray-500">${$.escape(homepageModule.selectedRecentOrder?.first_name || 'Someone')} from ${$.escape(homepageModule.selectedRecentOrder?.city || 'nearby')}</p> <strong class="block text-sm text-primary">${$.escape(homepageModule.selectedRecentOrder?.title || 'a menu item')}</strong> <span class="text-xs text-gray-500">${$.escape(timestampToAgo(homepageModule.selectedRecentOrder?.created_at || homepageModule.selectedRecentOrder?.createdAt || ''))}</span></div></a> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'h-7 w-7 self-start',
				onclick: () => homepageModule.showRecentOrderPopup = false,
				'aria-label': 'Close recent order',
				children: ($$renderer) => {
					X($$renderer, { class: 'h-4 w-4' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}