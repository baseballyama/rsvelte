import * as $ from 'svelte/internal/server';
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

export default function Product_details($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();
		const data = $.derived(() => page.data);
		const showPincodeCheck = $.derived(() => productState.wareHousePluginEnabled && productState.isIndianPincodesPluginEnabled);

		/** Strip HTML tags and collapse whitespace; returns '' for placeholder-only values like "-". */
		const cleanHtmlText = (value) => {
			const text = String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

			return (/^[\s\-–—._,]*$/).test(text) ? '' : text;
		};

		const storeName = $.derived(() => data()?.store?.name || '');

		// This is a white-label template: the merchant's own name comes from store settings, and no
		// delivery/returns promise is made on their behalf unless their own copy says so.
		const metaTitle = $.derived(() => data()?.product?.metaTitle || [data()?.product?.title, storeName()].filter(Boolean).join(' | '));

		// Feed data sometimes carries placeholder descriptions ("-"); never surface them in meta tags.
		// When a product has no copy of its own, fall through to SeoHeader's store-level default
		// rather than repeating one boilerplate sentence across the whole catalogue.
		const metaDescription = $.derived(() => {
			const provided = cleanHtmlText(data()?.product?.metaDescription);

			if (provided) return provided;

			const description = cleanHtmlText(data()?.product?.description);

			if (data()?.product?.title && description) {
				return `${data().product.title}. ${description}`.slice(0, 300).trim();
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
		const priceValidUntil = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

		// Product JSON-LD, built here from SSR load data.
		//
		// `productState.structuredData` is assembled inside a `$effect` in the core composable, and
		// `$effect` never runs during SSR — so the server-rendered ld+json was an empty husk for every
		// product (no name, no price, no availability) for every non-JS crawler. A `$derived` off
		// `data.product` is server-visible. It also lets the fields the page already has actually
		// reach the markup: gtin13 (barcode), weight, category and the real customer reviews.
		const productSchema = $.derived(() => {
			const p = data()?.product;

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
			const brandName = p.brandName || storeName();
			const category = p.category?.name || (typeof p.category === 'string' ? p.category : '');
			const weightUnit = data()?.store?.weight_unit;

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
					priceCurrency: data()?.store?.currency?.code,
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SeoHeader($$renderer, {
				metaTitle: metaTitle(),
				metaDescription: metaDescription(),
				metaKeywords: data()?.product?.keywords || '',
				image: data()?.product?.thumbnail || ''
			});

			$$renderer.push(`<!----> `);
			StructuredData($$renderer, { schema: productSchema() });
			$$renderer.push(`<!----> `);
			GoogleStructuredDataBreadcrumb($$renderer, { categoryHierarchy: data()?.product?.categoryHierarchy || [] });
			$$renderer.push(`<!----> `);

			if (data()?.product) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(productVideoUrls());

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let videoUrl = each_array[$$index];

					GoogleStructuredVideoSchema($$renderer, {
						name: data().product.title,
						description: cleanHtmlText(data().product.description) || data().product.title,
						thumbnailUrl: data().product.thumbnail,
						uploadDate: data().product.updatedAt || new Date().toISOString(),
						embedUrl: videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? videoUrl : undefined,
						contentUrl: videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') ? videoUrl : undefined
					});
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="intra-pt page-width hidden md:block">`);
			Breadcrumb($$renderer, { categoryHierarchy: data()?.product?.categoryHierarchy });
			$$renderer.push(`<!----></div> <div class="page-width intra-gap flex flex-col edp-root">`);

			if (!data()?.product && !productState.isLoading) {
				$$renderer.push(`<!--[0--><div class="flex h-96 flex-col items-center justify-center space-y-4"><h2 class="page-heading edp-empty-title">Product not found</h2> <a href="/products" class="text-sm font-bold uppercase tracking-widest text-primary underline underline-offset-4 edp-empty-link">Browse All Products</a></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="inter-gap relative grid grid-cols-1 items-start lg:grid-cols-2 edp-grid"><div class="col-span-1 sm:mt-0">`);
				ProductGallerySection($$renderer, {});
				$$renderer.push(`<!----></div> <div class="block md:hidden">`);
				Breadcrumb($$renderer, { categoryHierarchy: data()?.product?.categoryHierarchy });
				$$renderer.push(`<!----></div> <div class="intra-gap top-28 mx-0 lg:pl-6 flex flex-col space-y-0 edp-buybox">`);
				ProductTitleSection($$renderer, { product: data()?.product });
				$$renderer.push(`<!----> `);
				ProductPricing($$renderer, {});
				$$renderer.push(`<!----> `);
				ProductAggregation($$renderer, {});
				$$renderer.push(`<!----> <div class="intra-gap flex flex-col">`);
				ProductVariation($$renderer, {});
				$$renderer.push(`<!----> <div class="intra-gap hidden flex-col sm:flex mt-2">`);
				ProductCartAndWishlistButtons($$renderer, {});
				$$renderer.push(`<!----></div> `);

				if (showPincodeCheck()) {
					$$renderer.push(`<!--[0--><div class="intra-gap border-t intra-pt flex flex-col"><div class="intra-gap flex items-center justify-start">`);
					Truck($$renderer, { class: 'size-4 text-gray-900' });
					$$renderer.push(`<!----> <span class="text-sm text-gray-900">Delivery Options</span></div> `);
					PincodeCheck($$renderer, {});
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (productState.trustBadgesPlugin?.active) {
					$$renderer.push(`<!--[0--><div class="border-t border-gray-100 intra-pt">${$.html(productState.trustBadgesPlugin?.html)}</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (productState.returnPlugin && productState.returnPlugin?.active && productState.returnPlugin?.html) {
					$$renderer.push(`<!--[0--><div><h3 class="mb-2 text-base font-bold text-gray-900">Returns &amp; Exchanges</h3> <div${$.attr_class(`text-sm leading-relaxed text-gray-600 ${!productState.showReturnPolicy ? 'line-clamp-2 overflow-hidden' : ''}`)}>${$.html(productState.returnPlugin?.html)}</div> `);

					if (productState.returnPlugin?.below_more) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'link',
							class: 'h-auto p-0 mt-1',
							onclick: () => productState.showReturnPolicy = !productState.showReturnPolicy,
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(productState.showReturnPolicy ? 'Show Less' : 'Read Full Policy')}`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div>`);
				StoreCheck($$renderer, {});
				$$renderer.push(`<!----> `);
				ProductSpecifications($$renderer, {});
				$$renderer.push(`<!----> `);
				ProductDescription($$renderer, {});
				$$renderer.push(`<!----></div> `);
				ProductMetaDataSection($$renderer, {});
				$$renderer.push(`<!----></div> `);
				ProductTags($$renderer, {});
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--> `);
			ProductReviewsSection($$renderer, {});
			$$renderer.push(`<!----> <div>`);
			RelatedProducts($$renderer, {});
			$$renderer.push(`<!----></div></div> <div class="sticky inset-x-0 bottom-0 flex w-full items-center gap-3 border-t border-gray-100 bg-white/95 p-page shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] backdrop-blur-md sm:hidden edp-mobilebar"><div class="flex-1 flex flex-col intra-gap">`);
			ProductCartAndWishlistButtons($$renderer, { showWishlist: false });
			$$renderer.push(`<!----></div></div> `);

			LoginModal($$renderer, {
				get show() {
					return productState.showLoginModal;
				},

				set show($$value) {
					productState.showLoginModal = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			EnquiryModal($$renderer, {
				isOpen: productState.showEnquiryModal,
				productId: data()?.product?.id,
				productTitle: data()?.product?.title,
				onClose: () => productState.showEnquiryModal = false
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}