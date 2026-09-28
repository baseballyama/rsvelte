import * as $ from 'svelte/internal/server';

import {
	Heart,
	Minus,
	Plus,
	ShoppingCart,
	Truck,
	Shield,
	Leaf,
	Star,
	Tag,
	ArrowRight
} from '@lucide/svelte';

import { formatPrice } from '$lib/core/utils/index.js';
import { themeImage } from '../placeholder.js';

export default function OrganicHomepage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			themeContent,
			brandName,
			themeDescription,
			storeLogo,
			storeName,
			storeDescription,
			aspectWidth,
			aspectHeight,
			featuredCategories = [],
			featuredProducts = [],
			filterButtons = [],
			homepageModule,
			currencyCode
		} = $$props;

		// Content-declared icons, resolved to components here so the copy stays editable.
		const ICONS = {
			leaf: Leaf,
			shield: Shield,
			truck: Truck,
			star: Star,
			award: Star,
			zap: Truck
		};

		const stats = $.derived(() => themeContent.hero.stats ?? []);
		const features = $.derived(() => themeContent.about.features ?? []);
		const trustBadges = $.derived(() => themeContent.trust?.items ?? []);
		const promoBanners = $.derived(() => themeContent.promoBanners ?? []);

		// The promo grid's asymmetric layout lives in these three classes (grid-area only).
		const PROMO_VARIANTS = [
			'organic-promo-sale',
			'organic-promo-combo',
			'organic-promo-coupon'
		];

		const appDownload = $.derived(() => themeContent.appDownload);
		const labels = $.derived(() => themeContent.labels ?? {});

		// The live catalogue wins; the theme's tiles only stand in for a store with no categories.
		const displayCategories = $.derived(() => featuredCategories?.length
			? featuredCategories.map((category) => ({
				title: category?.name || category?.title || '',
				href: category?.slug ? '/' + category.slug : category?.link || '/products',
				image: category?.image || category?.thumbnail || category?.img || '',
				imageAlt: ''
			}))
			: themeContent.tiles?.categories ?? []);

		const displayProducts = $.derived(() => featuredProducts);

		/** Real rating out of 5, or 0 when the product carries none. */
		function ratingOf(product) {
			const value = Number(product?.rating ?? product?.ratings?.average ?? 0);

			return Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
		}

		function ratingCountOf(product) {
			return Number(product?.ratingCount ?? product?.ratings?.count ?? 0) || 0;
		}

		$$renderer.push(`<section class="organic-hero svelte-1nhk12g"${$.attr_style(themeContent.hero.backgroundImage
			? `background-image: url('${themeContent.hero.backgroundImage}')`
			: undefined)}><div class="organic-container organic-hero-shell svelte-1nhk12g"><div class="organic-hero-inner svelte-1nhk12g"><div class="organic-hero-content svelte-1nhk12g"><h1 class="svelte-1nhk12g"><span class="organic-text-primary svelte-1nhk12g">${$.escape(themeContent.hero.titleLead)}</span> ${$.escape(themeContent.hero.titleAccent)} <span class="svelte-1nhk12g">${$.escape(themeContent.hero.titleRest)}</span></h1> <p class="svelte-1nhk12g">${$.escape(themeContent.hero.text)}</p> <div class="organic-hero-actions svelte-1nhk12g"><a href="/products" class="organic-btn-primary svelte-1nhk12g">${$.escape(themeContent.hero.primaryCta)} `);

		ArrowRight($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----></a> <a href="/categories" class="organic-btn-secondary svelte-1nhk12g">${$.escape(themeContent.hero.secondaryCta)}</a></div></div></div></div></section> <section class="organic-stats svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-stats-grid svelte-1nhk12g"><!--[-->`);

		const each_array = $.ensure_array_like(stats());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let stat = each_array[$$index];

			$$renderer.push(`<div class="organic-stat-item svelte-1nhk12g"><strong class="svelte-1nhk12g">${$.escape(stat.value)}${$.escape(stat.suffix ?? '')}</strong> <span class="svelte-1nhk12g">${$.escape(stat.label)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="organic-features svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-features-grid svelte-1nhk12g"><!--[-->`);

		const each_array_1 = $.ensure_array_like(features());

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let feature = each_array_1[$$index_1];
			const FeatureIcon = ICONS[feature.icon] ?? Leaf;

			$$renderer.push(`<div class="organic-feature-card svelte-1nhk12g"><div class="organic-feature-icon svelte-1nhk12g">`);

			if (FeatureIcon) {
				$$renderer.push('<!--[-->');
				FeatureIcon($$renderer, { class: 'h-6 w-6' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <h3 class="svelte-1nhk12g">${$.escape(feature.title)}</h3> <p class="svelte-1nhk12g">${$.escape(feature.text)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> `);

		if (displayCategories().length > 0) {
			$$renderer.push(`<!--[0--><section class="organic-section svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-section-header svelte-1nhk12g"><div><h2 class="svelte-1nhk12g">${$.escape(themeContent.category.titleLead)} ${$.escape(themeContent.category.titleAccent)}</h2></div> <a href="/products" class="organic-view-all svelte-1nhk12g">${$.escape(labels().viewAll)} `);
			ArrowRight($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----></a></div> <div class="organic-category-grid svelte-1nhk12g"><!--[-->`);

			const each_array_2 = $.ensure_array_like(displayCategories().slice(0, 8));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let category = each_array_2[$$index_2];

				$$renderer.push(`<a${$.attr('href', category.href)} class="organic-category-card svelte-1nhk12g">`);

				if (category.image) {
					$$renderer.push(`<!--[0--><img${$.attr('src', themeImage(category.image, category.title))}${$.attr('alt', category.imageAlt || category.title)} class="svelte-1nhk12g"/>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="organic-category-placeholder svelte-1nhk12g">`);
					Leaf($$renderer, { class: 'h-8 w-8' });
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--> <span class="svelte-1nhk12g">${$.escape(category.title)}</span></a>`);
			}

			$$renderer.push(`<!--]--></div></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="organic-section organic-section-alt svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-section-header svelte-1nhk12g"><div><h2 class="svelte-1nhk12g">${$.escape(themeContent.menu.titleLead)} ${$.escape(themeContent.menu.titleAccent)}</h2></div> <a href="/products" class="organic-view-all svelte-1nhk12g">${$.escape(labels().viewAll)} `);
		ArrowRight($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----></a></div> `);

		if (displayProducts().length > 0) {
			$$renderer.push(`<!--[0--><div class="organic-product-grid svelte-1nhk12g"><!--[-->`);

			const each_array_3 = $.ensure_array_like(displayProducts().slice(0, 10));

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let product = each_array_3[$$index_3];
				const rating = ratingOf(product);

				$$renderer.push(`<a${$.attr('href', `/products/${$.stringify(product.slug)}`)} class="organic-product-card svelte-1nhk12g"><div class="organic-product-img svelte-1nhk12g"${$.attr_style(`aspect-ratio:${$.stringify(aspectWidth)}/${$.stringify(aspectHeight)};`)}>`);

				if (product.image || product.img || product.thumbnail) {
					$$renderer.push(`<!--[0--><img${$.attr('src', product.image || product.img || product.thumbnail)}${$.attr('alt', product.name || product.title)} class="svelte-1nhk12g"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (product.discount) {
					$$renderer.push(`<!--[0--><span class="organic-discount-badge svelte-1nhk12g">`);
					Tag($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!----> ${$.escape(product.discount)}${$.escape(themeContent.menu.discountSuffix)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="organic-product-info svelte-1nhk12g">`);

				if (rating > 0) {
					$$renderer.push(`<!--[0--><div class="organic-product-rating svelte-1nhk12g"><span>${$.escape(("★").repeat(Math.round(rating)))}${$.escape(("☆").repeat(5 - Math.round(rating)))}</span> `);

					if (ratingCountOf(product)) {
						$$renderer.push(`<!--[0--><small class="svelte-1nhk12g">(${$.escape(ratingCountOf(product))})</small>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <h3 class="svelte-1nhk12g">${$.escape(product.name || product.title)}</h3> <span class="organic-product-meta svelte-1nhk12g">${$.escape(labels().unit)}</span> <div class="organic-product-price svelte-1nhk12g">`);

				if (product.mrp && product.mrp > product.price) {
					$$renderer.push(`<!--[0--><span class="organic-price-old svelte-1nhk12g">${$.escape(formatPrice(product.mrp, currencyCode || ''))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <strong class="svelte-1nhk12g">${$.escape(formatPrice(product.price, currencyCode || ''))}</strong></div></div> <div class="organic-card-actions svelte-1nhk12g"><div class="organic-qty svelte-1nhk12g">`);
				Minus($$renderer, { class: 'h-3 w-3' });
				$$renderer.push(`<!----> <span>1</span> `);
				Plus($$renderer, { class: 'h-3 w-3' });
				$$renderer.push(`<!----></div> <button class="organic-add-to-cart svelte-1nhk12g">`);
				ShoppingCart($$renderer, { class: 'h-4 w-4' });
				$$renderer.push(`<!----> ${$.escape(labels().addToCart)}</button> `);
				Heart($$renderer, { class: 'h-5 w-5 organic-heart' });
				$$renderer.push(`<!----></div></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="organic-empty-state svelte-1nhk12g">`);
			Leaf($$renderer, { class: 'h-12 w-12 text-primary/30' });
			$$renderer.push(`<!----> <strong class="svelte-1nhk12g">${$.escape(themeContent.menu.emptyTitle)}</strong> <span class="svelte-1nhk12g">${$.escape(themeContent.menu.emptyText)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></section> <section class="organic-section svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-promo-grid svelte-1nhk12g"><!--[-->`);

		const each_array_4 = $.ensure_array_like(promoBanners());

		for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
			let banner = each_array_4[index];
			const variant = PROMO_VARIANTS[index] ?? '';

			$$renderer.push(`<div${$.attr_class(`organic-promo-card ${$.stringify(variant)}`, 'svelte-1nhk12g')}${$.attr_style(banner.image
				? `background-image: url('${banner.image}')`
				: undefined)}><div class="svelte-1nhk12g"><span class="svelte-1nhk12g">${$.escape(banner.eyebrow)}</span> <h3 class="svelte-1nhk12g">${$.escape(banner.title)}</h3> <a${$.attr('href', banner.href)} class="svelte-1nhk12g">${$.escape(banner.cta)} `);

			ArrowRight($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----></a></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="organic-newsletter svelte-1nhk12g"${$.attr_style(themeContent.newsletter.backgroundImage
			? `background-image: url('${themeContent.newsletter.backgroundImage}')`
			: undefined)}><div class="organic-container svelte-1nhk12g"><div class="organic-newsletter-inner svelte-1nhk12g"><div class="organic-newsletter-content svelte-1nhk12g"><span class="organic-section-label svelte-1nhk12g">${$.escape(themeContent.newsletter.label)}</span> <h2 class="svelte-1nhk12g">${$.escape(themeContent.newsletter.titleLead)} <span class="organic-text-secondary svelte-1nhk12g">${$.escape(themeContent.newsletter.titleAccent)}</span> ${$.escape(themeContent.newsletter.titleRest)}</h2> <p class="svelte-1nhk12g">${$.escape(themeContent.newsletter.text)}</p></div> <form class="organic-newsletter-form svelte-1nhk12g"><input type="email"${$.attr('placeholder', themeContent.newsletter.placeholder)} class="svelte-1nhk12g"/> <button type="submit" class="svelte-1nhk12g">${$.escape(themeContent.newsletter.cta)}</button></form></div></div></section> <section class="organic-app svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-app-inner svelte-1nhk12g"><div class="organic-app-content svelte-1nhk12g"><h2 class="svelte-1nhk12g">${$.escape(appDownload()?.title)}</h2> <p class="svelte-1nhk12g">${$.escape(appDownload()?.text)}</p> <div class="organic-app-buttons svelte-1nhk12g"><!--[-->`);

		const each_array_5 = $.ensure_array_like(appDownload()?.links ?? []);

		for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
			let link = each_array_5[$$index_5];

			$$renderer.push(`<a class="organic-app-link svelte-1nhk12g"${$.attr('href', link.href)}>${$.escape(link.label)}</a>`);
		}

		$$renderer.push(`<!--]--></div></div> <img class="organic-app-phone svelte-1nhk12g"${$.attr('src', themeImage(appDownload()?.image, 'organic-app'))}${$.attr('alt', appDownload()?.imageAlt)}/></div></div></section> <section class="organic-trust svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-trust-grid svelte-1nhk12g"><!--[-->`);

		const each_array_6 = $.ensure_array_like(trustBadges());

		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let badge = each_array_6[$$index_6];
			const BadgeIcon = ICONS[badge.icon ?? "leaf"] ?? Leaf;

			$$renderer.push(`<div class="organic-trust-item svelte-1nhk12g"><div class="organic-trust-icon svelte-1nhk12g">`);

			if (BadgeIcon) {
				$$renderer.push('<!--[-->');
				BadgeIcon($$renderer, { class: 'h-6 w-6' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div><strong class="svelte-1nhk12g">${$.escape(badge.title)}</strong> <span class="svelte-1nhk12g">${$.escape(badge.text)}</span></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}