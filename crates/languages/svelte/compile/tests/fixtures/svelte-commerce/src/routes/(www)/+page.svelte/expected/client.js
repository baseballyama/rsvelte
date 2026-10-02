import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="fixed bottom-20 right-4 z-50"><div class="flex max-w-[320px] gap-3 border-l-4 border-primary bg-white p-3.5 shadow-lg"><a class="flex gap-3 text-foreground"><img class="h-[58px] w-[58px] object-cover"/> <div><p class="text-xs text-gray-500"> </p> <strong class="block text-sm text-primary"> </strong> <span class="text-xs text-gray-500"> </span></div></a> <!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// `url.origin` already carries the scheme — prefixing it with another `https://` produced
	// `https://https://example.com` and broke the WebSite -> Organization @id join.
	const origin = $.derived(() => sveltePage.url.origin);

	const $$d = $.derived(() => $$props.data?.store?.productImageAspectRatio?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	setCollectionState();

	const page = $$props.data?.page || {};
	const homepageModule = new HomepageModule();
	const activeTheme = $.derived(() => $$props.data?.theme?.name || 'default');
	const ThemeHomepage = $.derived(() => themeHomepages[$.get(activeTheme)] || themeHomepages['default']);

	// Hardcoded theme content, with the store's admin-provided themeContent (store.theme.content)
	// merged over it section by section (falls back to the theme defaults for anything unset).
	const themeContent = $.derived(() => resolveThemeContent($.get(activeTheme), $$props.data?.store));

	// The store's own name wins; a theme's brandName is demo copy for previewing the theme.
	const brandName = $.derived(() => $$props.data?.store?.name || $.get(themeContent).brandName || 'Store');

	const themeDescription = $.derived(() => $.get(themeContent).description || page?.metaDescription || '');

	// Server data first, module second. `+page.ts` fetches both so they are in the SSR HTML;
	// HomepageModule then populates its own copies on the client and takes over once it has them
	// (it owns the load-more accumulator, so its list grows past this first page).
	const featuredCategories = $.derived(() => homepageModule.featuredCategories?.length
		? homepageModule.featuredCategories
		: $$props.data?.featuredCategories ?? []);

	const featuredProducts = $.derived(() => homepageModule.featuredProducts?.length
		? homepageModule.featuredProducts
		: $$props.data?.featuredProducts ?? []);

	// Section-driven themes ship their homepage as data (`themeLayout` from the API) and are
	// rendered with the shared section library. Themes that still have a bespoke component fall
	// back to it, so both kinds work side by side while themes are migrated.
	const themeLayout = $.derived(() => $$props.data?.store?.themeLayout);

	const sectionContext = $.derived(() => ({
		content: $.get(themeContent),
		brandName: $.get(brandName),
		currencyCode: $$props.data?.store?.currency?.code,
		aspectWidth: $.get(aspectWidth),
		aspectHeight: $.get(aspectHeight),
		featuredProducts: $.get(featuredProducts),
		featuredCategories: $.get(featuredCategories),
		loading: homepageModule.loading,
		ProductCard
	}));

	const filterButtons = $.derived(() => [
		'All',
		...$.get(featuredCategories).map((category) => category?.name || category?.title).filter(Boolean).slice(0, 6)
	]);

	// Organization JSON-LD, built here rather than via GoogleStructuredDataOrganization, whose
	// prop defaults hardcode `@type: ['Organization','JewelryStore']` and `priceRange: '$$$'` —
	// wrong for every non-jewellery store deployed from this white-label template, and not
	// overridable by passing `undefined` (that just re-selects the default).
	const organizationSchema = $.derived(() => {
		const store = $$props.data?.store;

		const social = store?.socialSharing?.active
			? Object.values(store?.socialSharing || {}).filter((link) => typeof link === 'string' && link.startsWith('http'))
			: [];

		if (!social.length) {
			const plugin = store?.plugins?.socialSharingButtons || {};

			for (const key in plugin) {
				if (key !== 'active' && plugin[key]) social.push(plugin[key]);
			}
		}

		const description = cleanSchemaText($.get(themeDescription) || store?.description);
		const logo = $$props.data?.store?.logo;

		return {
			'@context': 'https://schema.org',
			// The store declares its own entity type; anything else would be a guess.
			'@type': store?.schemaType || 'Organization',
			'@id': `${$.get(origin)}/#organization`,
			name: $.get(brandName),
			url: $.get(origin),
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
		const description = cleanSchemaText($$props.data?.store?.description);

		return {
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: $$props.data?.store?.name,
			...description ? { description } : {},
			url: $.get(origin),
			publisher: { '@id': `${$.get(origin)}/#organization` },
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: `${$.get(origin)}/{search_term_string}`
				},
				'query-input': 'required name=search_term_string'
			}
		};
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	ProductListSchema(node, {
		get products() {
			return $.get(featuredProducts);
		}
	});

	var node_1 = $.sibling(node, 2);

	StructuredData(node_1, {
		get schema() {
			return $.get(organizationSchema);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	StructuredData(node_2, {
		get schema() {
			return $.get(websiteSchema);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => $.get(themeContent).seoTitle || page?.metaTitle || $.get(brandName));
		let $1 = $.derived(() => page?.metaKeywords);
		let $2 = $.derived(() => $.get(themeContent).seoImage || page?.logo || $$props.data?.store?.logo);

		SeoHeader(node_3, {
			get metaTitle() {
				return $.get($0);
			},

			get metaDescription() {
				return $.get(themeDescription);
			},

			get metaKeywords() {
				return $.get($1);
			},

			get image() {
				return $.get($2);
			}
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent = ($$anchor) => {
			ThemeSections($$anchor, {
				get layout() {
					return $.get(themeLayout);
				},

				get ctx() {
					return $.get(sectionContext);
				}
			});
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => $$props.data?.store?.logo);
				let $1 = $.derived(() => $$props.data?.store?.name);
				let $2 = $.derived(() => $$props.data?.store?.description);
				let $3 = $.derived(() => page?.desktopBanners);
				let $4 = $.derived(() => page?.tabletBanners);
				let $5 = $.derived(() => page?.mobileBanners);
				let $6 = $.derived(() => page?.sections);
				let $7 = $.derived(() => $$props.data?.store?.currency?.code);

				$.component(node_5, () => $.get(ThemeHomepage), ($$anchor, $$component) => {
					$$component($$anchor, {
						get themeContent() {
							return $.get(themeContent);
						},

						get brandName() {
							return $.get(brandName);
						},

						get themeDescription() {
							return $.get(themeDescription);
						},

						get storeLogo() {
							return $.get($0);
						},

						get storeName() {
							return $.get($1);
						},

						get storeDescription() {
							return $.get($2);
						},

						get aspectWidth() {
							return $.get(aspectWidth);
						},

						get aspectHeight() {
							return $.get(aspectHeight);
						},

						get featuredCategories() {
							return $.get(featuredCategories);
						},

						get featuredProducts() {
							return $.get(featuredProducts);
						},

						get filterButtons() {
							return $.get(filterButtons);
						},

						get homepageModule() {
							return homepageModule;
						},

						get loading() {
							return homepageModule.loading;
						},

						get desktopBanners() {
							return $.get($3);
						},

						get tabletBanners() {
							return $.get($4);
						},

						get mobileBanners() {
							return $.get($5);
						},

						get pageSections() {
							return $.get($6);
						},

						get currencyCode() {
							return $.get($7);
						}
					});
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node_4, ($$render) => {
			if ($.get(themeLayout)?.sections?.length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var a = $.child(div_1);
			var img = $.child(a);
			var div_2 = $.sibling(img, 2);
			var p = $.child(div_2);
			var text = $.only_child(p);
			var strong = $.sibling(p, 2);
			var text_1 = $.only_child(strong, true);
			var span = $.sibling(strong, 2);
			var text_2 = $.only_child(span, true);

			$.reset(div_2);
			$.reset(a);

			var node_7 = $.sibling(a, 2);

			Button(node_7, {
				variant: 'ghost',
				size: 'icon',
				class: 'h-7 w-7 self-start',
				onclick: () => homepageModule.showRecentOrderPopup = false,
				'aria-label': 'Close recent order',
				children: ($$anchor, $$slotProps) => {
					X($$anchor, { class: 'h-4 w-4' });
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', `/products/${(homepageModule.selectedRecentOrder?.slug || '') ?? ''}`);
					$.set_attribute(img, 'src', homepageModule.selectedRecentOrder?.image || homepageModule.selectedRecentOrder?.img || homepageModule.selectedRecentOrder?.thumbnail);
					$.set_attribute(img, 'alt', homepageModule.selectedRecentOrder?.title || 'Product');
					$.set_text(text, `${(homepageModule.selectedRecentOrder?.first_name || 'Someone') ?? ''} from ${(homepageModule.selectedRecentOrder?.city || 'nearby') ?? ''}`);
					$.set_text(text_1, homepageModule.selectedRecentOrder?.title || 'a menu item');
					$.set_text(text_2, $0);
				},
				[
					() => timestampToAgo(homepageModule.selectedRecentOrder?.created_at || homepageModule.selectedRecentOrder?.createdAt || '')
				]
			);

			$.transition(3, div, () => fly, () => ({ x: 50, duration: 150 }));
			$.append($$anchor, div);
		};

		$.if(node_6, ($$render) => {
			if (homepageModule.showRecentOrderPopup) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}