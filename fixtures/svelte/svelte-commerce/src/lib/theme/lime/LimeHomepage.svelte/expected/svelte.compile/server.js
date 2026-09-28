import * as $ from 'svelte/internal/server';

import {
	Plus,
	MapPin,
	BadgeCheck,
	RefreshCw,
	Tag,
	Truck,
	Undo2,
	Store
} from '@lucide/svelte';

import LimeProductCard from './LimeProductCard.svelte';
import { themeImage } from '../placeholder.js';

export default function LimeHomepage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			themeContent,
			brandName,
			featuredCategories = [],
			featuredProducts = [],
			currencyCode
		} = $$props;

		let subscribing = false;

		// Live catalogue categories win; the theme's tiles are the fallback for an empty store.
		const categories = $.derived(() => featuredCategories?.length
			? featuredCategories.slice(0, 7).map((category) => ({
				title: category?.name || category?.title || '',
				href: category?.slug ? '/' + category.slug : category?.link || '/products',
				image: category?.image || category?.thumbnail || category?.img || '',
				imageAlt: ''
			}))
			: themeContent.tiles?.categories ?? []);

		const collage = $.derived(() => themeContent.tiles?.collage ?? []);
		const featureTile = $.derived(() => themeContent.tiles?.feature);
		const trust = $.derived(() => themeContent.trust);

		// The source rendered each trust point as a text-in-image badge. Those are real icons and
		// real text now, so the section needs no asset files and stays readable at any size.
		const TRUST_ICONS = [
			[/certif/i, BadgeCheck],
			[/exchange/i, RefreshCw],
			[/pricing|price/i, Tag],
			[/shipping|delivery/i, Truck],
			[/return/i, Undo2],
			[/store|support/i, Store]
		];

		const trustIcon = (title = '') => TRUST_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? BadgeCheck;
		const faq = $.derived(() => themeContent.faq);

		async function subscribe() {
			subscribing = true;
			await new Promise((resolve) => setTimeout(resolve, 700));
			subscribing = false;
		}

		$$renderer.push(`<div class="lime-home svelte-bqnxlw"><section class="lime-hero svelte-bqnxlw"${$.attr('aria-label', `${$.stringify(brandName)} hero`)}><h1 class="lime-hero-title sr-only">${$.escape([themeContent.hero?.titleLead, themeContent.hero?.titleAccent].filter(Boolean).join(' ') || brandName)}</h1> <img${$.attr('src', themeImage(themeContent.hero.image, 'lime-hero'))}${$.attr('alt', themeContent.hero.imageAlt)} class="svelte-bqnxlw"/></section> <section class="lime-categories svelte-bqnxlw"><div class="lime-section-heading svelte-bqnxlw"><h2 class="svelte-bqnxlw">${$.escape(themeContent.category.label)}</h2> <p class="svelte-bqnxlw">${$.escape(themeContent.category.text)}</p></div> <div class="lime-category-row svelte-bqnxlw"><!--[-->`);

		const each_array = $.ensure_array_like(categories());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let category = each_array[$$index];

			$$renderer.push(`<a class="lime-category svelte-bqnxlw"${$.attr('href', category.href)}><img${$.attr('src', themeImage(category.image, category.title))}${$.attr('alt', category.imageAlt || category.title)} class="svelte-bqnxlw"/> <h3 class="svelte-bqnxlw">${$.escape(category.title)}</h3></a>`);
		}

		$$renderer.push(`<!--]--></div></section> `);

		if (collage()[0] || collage()[1] || collage()[2]) {
			$$renderer.push(`<!--[0--><section class="lime-collage svelte-bqnxlw">`);

			if (collage()[0]) {
				$$renderer.push(`<!--[0--><a class="lime-collage-large svelte-bqnxlw"${$.attr('href', collage()[0].href)}><img${$.attr('src', themeImage(collage()[0].image, collage()[0].imageAlt || collage()[0].href))}${$.attr('alt', collage()[0].imageAlt || collage()[0].title || '')} class="svelte-bqnxlw"/></a>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="lime-collage-stack svelte-bqnxlw"><!--[-->`);

			const each_array_1 = $.ensure_array_like(collage().slice(1, 3));

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let tile = each_array_1[$$index_1];

				$$renderer.push(`<a${$.attr('href', tile.href)} class="svelte-bqnxlw"><img${$.attr('src', themeImage(tile.image, tile.imageAlt || tile.href))}${$.attr('alt', tile.imageAlt || tile.title || '')} class="svelte-bqnxlw"/></a>`);
			}

			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (collage().length > 3) {
			$$renderer.push(`<!--[0--><section class="lime-split-campaign svelte-bqnxlw"><!--[-->`);

			const each_array_2 = $.ensure_array_like(collage().slice(3, 5));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let tile = each_array_2[$$index_2];

				$$renderer.push(`<a${$.attr('href', tile.href)} class="svelte-bqnxlw"><img${$.attr('src', themeImage(tile.image, tile.imageAlt || tile.href))}${$.attr('alt', tile.imageAlt || tile.title || '')} class="svelte-bqnxlw"/></a>`);
			}

			$$renderer.push(`<!--]--></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="lime-demand svelte-bqnxlw">`);

		if (featureTile()) {
			$$renderer.push(`<!--[0--><a class="lime-demand-feature svelte-bqnxlw"${$.attr('href', featureTile().href)}><img${$.attr('src', themeImage(featureTile().image, 'lime-feature', 'dark'))}${$.attr('alt', featureTile().imageAlt || featureTile().title || '')} class="svelte-bqnxlw"/> <span class="svelte-bqnxlw">${$.escape(featureTile().title)}</span></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="lime-product-grid svelte-bqnxlw">`);

		if (featuredProducts.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array_3 = $.ensure_array_like(featuredProducts.slice(0, 4));

			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
				let product = each_array_3[$$index_3];

				LimeProductCard($$renderer, { product, themeContent, aspectRatio: '1' });
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div class="lime-product-empty svelte-bqnxlw"><h4 class="svelte-bqnxlw">${$.escape(themeContent.menu.emptyTitle)}</h4> <p class="svelte-bqnxlw">${$.escape(themeContent.menu.emptyText)}</p></div>`);
		}

		$$renderer.push(`<!--]--></div></section> `);

		if (trust()?.items?.length) {
			$$renderer.push(`<!--[0--><section class="lime-trust svelte-bqnxlw">`);

			if (trust().title) {
				$$renderer.push(`<!--[0--><h2 class="lime-trust-heading svelte-bqnxlw">${$.escape(trust().title)}</h2>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="lime-trust-grid svelte-bqnxlw"><!--[-->`);

			const each_array_4 = $.ensure_array_like(trust().items);

			for (let index = 0, $$length = each_array_4.length; index < $$length; index++) {
				let item = each_array_4[index];
				const TrustIcon = trustIcon(item.title);

				$$renderer.push(`<p class="lime-trust-item svelte-bqnxlw">`);

				if (TrustIcon) {
					$$renderer.push('<!--[-->');
					TrustIcon($$renderer, { 'aria-hidden': 'true' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` <span>${$.escape(item.title || `${brandName} trust point ${index + 1}`)}</span></p>`);
			}

			$$renderer.push(`<!--]--></div></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <section class="lime-story svelte-bqnxlw"><img${$.attr('src', themeImage(themeContent.about.primaryImage, 'lime-story'))}${$.attr('alt', themeContent.about.primaryImageAlt)} class="svelte-bqnxlw"/> <div><h2 class="svelte-bqnxlw">${$.escape(themeContent.about.label)}</h2> <p class="svelte-bqnxlw">${$.escape(themeContent.about.text)}</p> <a href="/about-us" class="svelte-bqnxlw">${$.escape(themeContent.about.cta)}</a></div></section> <section class="lime-store svelte-bqnxlw"><div class="svelte-bqnxlw"><h2 class="svelte-bqnxlw">${$.escape(themeContent.special.titleLead)} ${$.escape(themeContent.special.titleAccent)}</h2> <p class="svelte-bqnxlw">${$.escape(themeContent.special.text)}</p> <a href="/contact-us" class="svelte-bqnxlw">`);
		MapPin($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.special.cta)}</a></div> <img${$.attr('src', themeImage(themeContent.special.image, 'lime-store'))}${$.attr('alt', themeContent.special.imageAlt)} class="svelte-bqnxlw"/></section> <section class="lime-faq svelte-bqnxlw"><h2 class="svelte-bqnxlw">${$.escape(faq()?.label)}</h2> <div class="lime-faq-list svelte-bqnxlw"><!--[-->`);

		const each_array_5 = $.ensure_array_like(faq()?.items ?? []);

		for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
			let item = each_array_5[index];

			$$renderer.push(`<details${$.attr('open', index === 0, true)} class="svelte-bqnxlw"><summary class="svelte-bqnxlw">${$.escape(item.question)}`);
			Plus($$renderer, { class: 'lime-faq-icon h-4 w-4' });
			$$renderer.push(`<!----></summary> <p class="svelte-bqnxlw">${$.escape(item.answer)}</p></details>`);
		}

		$$renderer.push(`<!--]--></div></section></div>`);
	});
}