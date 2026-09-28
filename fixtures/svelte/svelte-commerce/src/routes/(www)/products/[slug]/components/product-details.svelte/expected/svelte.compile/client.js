import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoginModal from '$lib/components/auth/login-modal.svelte';
import EnquiryModal from '$lib/core/components/plugins/enquiry-modal.svelte';
import { GoogleStructuredDataBreadcrumb, GoogleStructuredVideoSchema } from '$lib/core/components/index.js';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import StructuredData from '$lib/components/seo/structured-data.svelte';
import { availabilityUrl } from '$lib/components/seo/schema.js';
import PincodeCheck from '$lib/components/product-catalogue/pincode-check.svelte';
import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
import { useProductState } from '$lib/core/composables/index.js';
import { Truck } from '@lucide/svelte';
import ProductAggregation from './product-aggregation.svelte';
import ProductCartAndWishlistButtons from './product-cart-and-wishlist-buttons.svelte';
import ProductDescription from './product-description.svelte';
import ProductGallerySection from './product-gallery-section.svelte';
import ProductMetaDataSection from './product-meta-data-section.svelte';
import ProductPricing from './product-pricing.svelte';
import ProductReviewsSection from './product-reviews-section.svelte';
import ProductSpecifications from './product-specifications.svelte';
import ProductTags from './product-tags.svelte';
import ProductTitleSection from './product-title-section.svelte';
import ProductVariation from './product-variation.svelte';
import RelatedProducts from './related-products.svelte';
import StoreCheck from './store-check.svelte';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button/index.js';

var root = $.from_html(`<div class="flex h-96 flex-col items-center justify-center space-y-4"><h2 class="page-heading edp-empty-title">Product not found</h2> <a href="/products" class="text-sm font-bold uppercase tracking-widest text-primary underline underline-offset-4 edp-empty-link">Browse All Products</a></div>`);
var root_1 = $.from_html(`<div class="intra-gap border-t intra-pt flex flex-col"><div class="intra-gap flex items-center justify-start"><!> <span class="text-sm  text-gray-900">Delivery Options</span></div> <!></div>`);
var root_2 = $.from_html(`<div class="border-t border-gray-100 intra-pt"></div>`);
var root_3 = $.from_html(`<div><h3 class="mb-2 text-base font-bold text-gray-900">Returns & Exchanges</h3> <div></div> <!></div>`);
var root_4 = $.from_html(`<div class="inter-gap relative grid grid-cols-1 items-start lg:grid-cols-2 edp-grid"><div class="col-span-1 sm:mt-0 "><!></div> <div class="block md:hidden"><!></div> <div class="intra-gap top-28 mx-0 lg:pl-6 flex flex-col space-y-0 edp-buybox"><!> <!> <!> <div class="intra-gap flex flex-col"><!> <div class="intra-gap hidden flex-col sm:flex mt-2"><!></div> <!> <!> <!> <div><!> <!> <!></div> <!></div> <!></div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <div class="intra-pt page-width hidden md:block"><!></div> <div class="page-width intra-gap flex flex-col edp-root"><!> <!> <div><!></div></div> <div class="sticky inset-x-0 bottom-0 flex w-full items-center gap-3 border-t border-gray-100 bg-white/95 p-page shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] backdrop-blur-md sm:hidden edp-mobilebar"><div class="flex-1 flex flex-col intra-gap"><!></div></div> <!> <!>`, 1);

export default function Product_details($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	const data = $.derived(() => page.data);
	const showPincodeCheck = $.derived(() => productState.wareHousePluginEnabled && productState.isIndianPincodesPluginEnabled);

	/** Strip HTML tags and collapse whitespace; returns '' for placeholder-only values like "-". */
	const cleanHtmlText = (value) => {
		const text = String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

		return (/^[\s\-–—._,]*$/).test(text) ? '' : text;
	};

	const storeName = $.derived(() => $.get(data)?.store?.name || '');

	// This is a white-label template: the merchant's own name comes from store settings, and no
	// delivery/returns promise is made on their behalf unless their own copy says so.
	const metaTitle = $.derived(() => $.get(data)?.product?.metaTitle || [$.get(data)?.product?.title, $.get(storeName)].filter(Boolean).join(' | '));

	// Feed data sometimes carries placeholder descriptions ("-"); never surface them in meta tags.
	// When a product has no copy of its own, fall through to SeoHeader's store-level default
	// rather than repeating one boilerplate sentence across the whole catalogue.
	const metaDescription = $.derived(() => {
		const provided = cleanHtmlText($.get(data)?.product?.metaDescription);

		if (provided) return provided;

		const description = cleanHtmlText($.get(data)?.product?.description);

		if ($.get(data)?.product?.title && description) {
			return `${$.get(data).product.title}. ${description}`.slice(0, 300).trim();
		}

		return '';
	});

	// Video URLs mixed into the product image list (YouTube or hosted mp4/webm) get a VideoObject schema.
	const productVideoUrls = $.derived(() => productState.productImagesArray?.filter((img) => img.includes('youtube.com') || img.includes('youtu.be') || img.endsWith('.mp4') || img.endsWith('.webm')) || []);

	// GA4 view_item — fires once per product (also on client-side navigation). Reads
	// window.gtag at call time (defined by the GoogleAnalytics loader in the root layout,
	// driven by the store's googleTagManager plugin); safe no-op when analytics is off.
	const trackViewItem = (p, currency) => {
		if (typeof window === 'undefined') return;

		const g = window.gtag;

		if (typeof g !== 'function') return;

		try {
			g('event', 'view_item', {
				currency,
				value: p?.price,
				items: [
					{
						item_id: p?.sku ?? p?.id,
						item_name: p?.title ?? p?.name,
						item_brand: p?.brandName ?? p?.brand?.name,
						item_category: p?.category?.name ?? p?.category,
						price: p?.price,
						quantity: 1,
						...currency ? { currency } : {}
					}
				]
			});
		} catch {
			/* never let analytics break the app */
		}
	};

	let lastViewedProductId = '';

	$.user_effect(() => {
		const p = page.data.product;

		if (p?.id && p.id !== lastViewedProductId) {
			lastViewedProductId = p.id;
			trackViewItem(p, page.data.store?.currency?.code);
		}
	});

	const priceValidUntil = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	// Product JSON-LD, built here from SSR load data.
	//
	// `productState.structuredData` is assembled inside a `$effect` in the core composable, and
	// `$effect` never runs during SSR — so the server-rendered ld+json was an empty husk for every
	// product (no name, no price, no availability) for every non-JS crawler. A `$derived` off
	// `data.product` is server-visible. It also lets the fields the page already has actually
	// reach the markup: gtin13 (barcode), weight, category and the real customer reviews.
	const productSchema = $.derived(() => {
		const p = $.get(data)?.product;

		if (!p) return '';

		const images = p.images
			? String(p.images).split(',').map((i) => i.trim()).filter(Boolean)
			: [p.thumbnail].filter(Boolean);

		const ratings = p.ratings ?? [];
		const scored = ratings.filter((r) => Number(r?.rating) > 0);
		const reviewCount = Number(p.reviewCount) || scored.length;

		const ratingValue = Number(p.rating) || (scored.length
			? Math.round(scored.reduce((a, r) => a + Number(r.rating), 0) / scored.length * 10) / 10
			: 0);

		const description = cleanHtmlText(p.description);
		const brandName = p.brandName || $.get(storeName);
		const category = p.category?.name || (typeof p.category === 'string' ? p.category : '');
		const weightUnit = $.get(data)?.store?.weight_unit;

		return {
			'@context': 'https://schema.org/',
			'@type': 'Product',
			name: p.title,
			image: images,
			...description ? { description } : {},
			...p.sku ? { sku: p.sku } : {},
			...p.barcode ? { gtin13: String(p.barcode) } : {},
			...category ? { category } : {},
			...p.weight
				? {
					weight: {
						'@type': 'QuantitativeValue',
						value: p.weight,
						...weightUnit ? { unitText: weightUnit } : {}
					}
				}
				: {},
			...brandName ? { brand: { '@type': 'Brand', name: brandName } } : {},
			// Never fabricate stars: an aggregateRating is emitted only when there is a real one.
			...reviewCount > 0 && ratingValue > 0
				? {
					aggregateRating: {
						'@type': 'AggregateRating',
						ratingValue,
						reviewCount,
						ratingCount: reviewCount
					}
				}
				: {},

			...scored.length
				? {
					review: scored.map((r) => ({
						'@type': 'Review',
						...r?.name ? { author: { '@type': 'Person', name: r.name } } : {},
						...r?.createdAt ? { datePublished: r.createdAt } : {},
						...cleanHtmlText(r?.review) ? { reviewBody: cleanHtmlText(r.review) } : {},
						reviewRating: {
							'@type': 'Rating',
							ratingValue: Number(r.rating),
							bestRating: 5,
							worstRating: 1
						}
					}))
				}
				: {},

			offers: {
				'@type': 'Offer',
				url: page.url.href,
				priceCurrency: $.get(data)?.store?.currency?.code,
				price: p.price,
				availability: availabilityUrl(p.stock),
				priceValidUntil,
				// Emitted only when the API carries them — a type-only husk with none of the
				// required properties is a validation error, not a partial win.
				...p.shippingDetails
					? {
						shippingDetails: { '@type': 'OfferShippingDetails', ...p.shippingDetails }
					}
					: {},

				...p.hasMerchantReturnPolicy
					? {
						hasMerchantReturnPolicy: {
							'@type': 'MerchantReturnPolicy',
							...p.hasMerchantReturnPolicy
						}
					}
					: {}
			}
		};
	});

	var fragment = root_5();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(data)?.product?.keywords || '');
		let $1 = $.derived(() => $.get(data)?.product?.thumbnail || '');

		SeoHeader(node, {
			get metaTitle() {
				return $.get(metaTitle);
			},

			get metaDescription() {
				return $.get(metaDescription);
			},

			get metaKeywords() {
				return $.get($0);
			},

			get image() {
				return $.get($1);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	StructuredData(node_1, {
		get schema() {
			return $.get(productSchema);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => $.get(data)?.product?.categoryHierarchy || []);

		GoogleStructuredDataBreadcrumb(node_2, {
			get categoryHierarchy() {
				return $.get($0);
			}
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_4 = $.first_child(fragment_1);

			$.each(node_4, 17, () => $.get(productVideoUrls), $.index, ($$anchor, videoUrl) => {
				{
					let $0 = $.derived(() => cleanHtmlText($.get(data).product.description) || $.get(data).product.title);
					let $1 = $.derived(() => $.get(data).product.updatedAt || new Date().toISOString());
					let $2 = $.derived(() => $.get(videoUrl).includes('youtube.com') || $.get(videoUrl).includes('youtu.be') ? $.get(videoUrl) : undefined);
					let $3 = $.derived(() => $.get(videoUrl).endsWith('.mp4') || $.get(videoUrl).endsWith('.webm') ? $.get(videoUrl) : undefined);

					GoogleStructuredVideoSchema($$anchor, {
						get name() {
							return $.get(data).product.title;
						},

						get description() {
							return $.get($0);
						},

						get thumbnailUrl() {
							return $.get(data).product.thumbnail;
						},

						get uploadDate() {
							return $.get($1);
						},

						get embedUrl() {
							return $.get($2);
						},

						get contentUrl() {
							return $.get($3);
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if ($.get(data)?.product) $$render(consequent);
		});
	}

	var div = $.sibling(node_3, 2);
	var node_5 = $.child(div);

	{
		let $0 = $.derived(() => $.get(data)?.product?.categoryHierarchy);

		Breadcrumb(node_5, {
			get categoryHierarchy() {
				return $.get($0);
			}
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_6 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root();

			$.append($$anchor, div_2);
		};

		var alternate_2 = ($$anchor) => {
			var div_3 = root_4();
			var div_4 = $.child(div_3);
			var node_7 = $.child(div_4);

			ProductGallerySection(node_7, {});
			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_8 = $.child(div_5);

			{
				let $0 = $.derived(() => $.get(data)?.product?.categoryHierarchy);

				Breadcrumb(node_8, {
					get categoryHierarchy() {
						return $.get($0);
					}
				});
			}

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_9 = $.child(div_6);

			{
				let $0 = $.derived(() => $.get(data)?.product);

				ProductTitleSection(node_9, {
					get product() {
						return $.get($0);
					}
				});
			}

			var node_10 = $.sibling(node_9, 2);

			ProductPricing(node_10, {});

			var node_11 = $.sibling(node_10, 2);

			ProductAggregation(node_11, {});

			var div_7 = $.sibling(node_11, 2);
			var node_12 = $.child(div_7);

			ProductVariation(node_12, {});

			var div_8 = $.sibling(node_12, 2);
			var node_13 = $.child(div_8);

			ProductCartAndWishlistButtons(node_13, {});
			$.reset(div_8);

			var node_14 = $.sibling(div_8, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_9 = root_1();
					var div_10 = $.child(div_9);
					var node_15 = $.child(div_10);

					Truck(node_15, { class: 'size-4 text-gray-900' });
					$.next(2);
					$.reset(div_10);

					var node_16 = $.sibling(div_10, 2);

					PincodeCheck(node_16, {});
					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var alternate = ($$anchor) => {};

				$.if(node_14, ($$render) => {
					if ($.get(showPincodeCheck)) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			var node_17 = $.sibling(node_14, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_11 = root_2();

					$.html(div_11, () => productState.trustBadgesPlugin?.html, true);
					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				$.if(node_17, ($$render) => {
					if (productState.trustBadgesPlugin?.active) $$render(consequent_3);
				});
			}

			var node_18 = $.sibling(node_17, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_12 = root_3();
					var div_13 = $.sibling($.child(div_12), 2);

					$.html(div_13, () => productState.returnPlugin?.html, true);
					$.reset(div_13);

					var node_19 = $.sibling(div_13, 2);

					{
						var consequent_4 = ($$anchor) => {
							Button($$anchor, {
								variant: 'link',
								class: 'h-auto p-0 mt-1',
								onclick: () => productState.showReturnPolicy = !productState.showReturnPolicy,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(() => $.set_text(text_1, productState.showReturnPolicy ? 'Show Less' : 'Read Full Policy'));
									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_19, ($$render) => {
							if (productState.returnPlugin?.below_more) $$render(consequent_4);
						});
					}

					$.reset(div_12);
					$.template_effect(() => $.set_class(div_13, 1, `text-sm leading-relaxed text-gray-600 ${!productState.showReturnPolicy ? 'line-clamp-2 overflow-hidden' : ''}`));
					$.append($$anchor, div_12);
				};

				var alternate_1 = ($$anchor) => {};

				$.if(node_18, ($$render) => {
					if (productState.returnPlugin && productState.returnPlugin?.active && productState.returnPlugin?.html) $$render(consequent_5); else $$render(alternate_1, -1);
				});
			}

			var div_14 = $.sibling(node_18, 2);
			var node_20 = $.child(div_14);

			StoreCheck(node_20, {});

			var node_21 = $.sibling(node_20, 2);

			ProductSpecifications(node_21, {});

			var node_22 = $.sibling(node_21, 2);

			ProductDescription(node_22, {});
			$.reset(div_14);

			var node_23 = $.sibling(div_14, 2);

			ProductMetaDataSection(node_23, {});
			$.reset(div_7);

			var node_24 = $.sibling(div_7, 2);

			ProductTags(node_24, {});
			$.reset(div_6);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_6, ($$render) => {
			if (!$.get(data)?.product && !productState.isLoading) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	var node_25 = $.sibling(node_6, 2);

	ProductReviewsSection(node_25, {});

	var div_15 = $.sibling(node_25, 2);
	var node_26 = $.child(div_15);

	RelatedProducts(node_26, {});
	$.reset(div_15);
	$.reset(div_1);

	var div_16 = $.sibling(div_1, 2);
	var div_17 = $.child(div_16);
	var node_27 = $.child(div_17);

	ProductCartAndWishlistButtons(node_27, { showWishlist: false });
	$.reset(div_17);
	$.reset(div_16);

	var node_28 = $.sibling(div_16, 2);

	LoginModal(node_28, {
		get show() {
			return productState.showLoginModal;
		},

		set show($$value) {
			productState.showLoginModal = $$value;
		}
	});

	var node_29 = $.sibling(node_28, 2);

	{
		let $0 = $.derived(() => $.get(data)?.product?.id);
		let $1 = $.derived(() => $.get(data)?.product?.title);

		EnquiryModal(node_29, {
			get isOpen() {
				return productState.showEnquiryModal;
			},

			get productId() {
				return $.get($0);
			},

			get productTitle() {
				return $.get($1);
			},
			onClose: () => productState.showEnquiryModal = false
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}