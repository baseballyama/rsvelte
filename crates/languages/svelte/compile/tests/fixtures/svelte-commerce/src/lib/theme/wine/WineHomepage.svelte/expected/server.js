import * as $ from 'svelte/internal/server';

import {
	ArrowRight,
	Award,
	BookOpen,
	CalendarCheck,
	ChefHat,
	Circle,
	Clock,
	Flame,
	Heart,
	Leaf,
	Lock,
	Mail,
	MapPin,
	Phone,
	Play,
	Plus,
	Quote,
	Search,
	Send,
	ShoppingCart,
	Star,
	Truck,
	Users,
	Utensils,
	Zap
} from '@lucide/svelte';

import { untrack } from 'svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { formatPrice } from '$lib/core/utils/index.js';
import { themeImage } from '../placeholder.js';

export default function WineHomepage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			themeContent,
			aspectWidth,
			aspectHeight,
			featuredCategories,
			featuredProducts,
			filterButtons,
			homepageModule,
			currencyCode
		} = $$props;

		const pad = (value) => String(Math.floor(value)).padStart(2, '0');
		const countdown = $.derived(() => themeContent.special.countdown);
		const countdownDuration = $.derived(() => themeContent.special.countdown?.durationSeconds ?? 0);
		const reservationForm = $.derived(() => themeContent.reservation.form);
		const contactForm = $.derived(() => themeContent.contact.form);
		const seedSeconds = untrack(() => themeContent.special.countdown?.durationSeconds ?? 0);
		let cdH = pad(seedSeconds / 3600);
		let cdM = pad(seedSeconds % 3600 / 60);
		let cdS = pad(seedSeconds % 60);

		$$renderer.push(`<section class="wine-hero svelte-1pdq8kk" id="hero"><div class="hero-shape hero-shape-one svelte-1pdq8kk"></div> <div class="hero-shape hero-shape-two svelte-1pdq8kk"></div> <div class="hero-bg-text svelte-1pdq8kk">${$.escape(themeContent.hero.bgText)}</div> <div class="wine-container hero-grid svelte-1pdq8kk"><div class="hero-copy svelte-1pdq8kk"><div class="hero-badge svelte-1pdq8kk"><span class="hero-badge-icon svelte-1pdq8kk">`);
		Star($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----></span> <span class="svelte-1pdq8kk">${$.escape(themeContent.hero.badge)}</span></div> <h1 class="svelte-1pdq8kk">${$.escape(themeContent.hero.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.hero.titleAccent)}</span><br class="svelte-1pdq8kk"/>${$.escape(themeContent.hero.titleRest)}</h1> <p class="hero-text svelte-1pdq8kk">${$.escape(themeContent.hero.text)}</p> <div class="hero-actions svelte-1pdq8kk"><a href="/products" class="wine-button primary svelte-1pdq8kk">`);
		Utensils($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> ${$.escape(themeContent.hero.primaryCta)}</a> <a href="/about-us" class="story-button svelte-1pdq8kk"><span class="svelte-1pdq8kk">`);
		Play($$renderer, { class: 'h-4 w-4 fill-current' });
		$$renderer.push(`<!----></span> ${$.escape(themeContent.hero.secondaryCta)}</a></div> <div class="hero-stats svelte-1pdq8kk" aria-label="Restaurant highlights"><!--[-->`);

		const each_array = $.ensure_array_like(themeContent.hero.stats);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let stat = each_array[index];

			$$renderer.push(`<div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(stat.value)}<em class="svelte-1pdq8kk">${$.escape(stat.suffix || '')}</em></strong><span class="svelte-1pdq8kk">${$.escape(stat.label)}</span></div> `);

			if (index < themeContent.hero.stats.length - 1) {
				$$renderer.push(`<!--[0--><i class="svelte-1pdq8kk"></i>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div> <div class="hero-plate svelte-1pdq8kk"${$.attr('aria-label', themeContent.hero.imageAlt)}><div class="plate-ring svelte-1pdq8kk"><img${$.attr('src', themeImage(themeContent.hero.image, 'wine-hero'))}${$.attr('alt', themeContent.hero.imageAlt)} class="svelte-1pdq8kk"/></div> <!--[-->`);

		const each_array_1 = $.ensure_array_like(themeContent.hero.floatingCards);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let card = each_array_1[index];

			$$renderer.push(`<div${$.attr_class(`floating-card fc${$.stringify(index + 1)}`, 'svelte-1pdq8kk')}><span${$.attr_class(`floating-icon ${$.stringify(card.tone)}`, 'svelte-1pdq8kk')}>`);

			if (card.icon === 'flame') {
				$$renderer.push('<!--[0-->');
				Flame($$renderer, { class: 'h-4 w-4' });
			} else if (card.icon === 'star') {
				$$renderer.push('<!--[1-->');
				Star($$renderer, { class: 'h-4 w-4 fill-current' });
			} else {
				$$renderer.push('<!--[-1-->');
				Clock($$renderer, { class: 'h-4 w-4' });
			}

			$$renderer.push(`<!--]--></span> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(card.title)}</strong><span class="svelte-1pdq8kk">${$.escape(card.text)}</span></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <div class="ticker svelte-1pdq8kk" aria-label="Popular menu categories"><div class="ticker-track svelte-1pdq8kk"><!--[-->`);

		const each_array_2 = $.ensure_array_like(Array(2));

		for (let $$index_3 = 0, $$length = each_array_2.length; $$index_3 < $$length; $$index_3++) {
			let _ = each_array_2[$$index_3];

			$$renderer.push(`<!--[-->`);

			const each_array_3 = $.ensure_array_like(themeContent.ticker);

			for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
				let item = each_array_3[$$index_2];

				$$renderer.push(`<span class="svelte-1pdq8kk">`);
				Circle($$renderer, { class: 'h-2 w-2 fill-current' });
				$$renderer.push(`<!---->${$.escape(item)}</span>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div> <section class="wine-section category-section svelte-1pdq8kk" id="category"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.category.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.category.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.category.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div> <p class="svelte-1pdq8kk">${$.escape(themeContent.category.text)}</p></div> `);

		if (homepageModule.loading) {
			$$renderer.push(`<!--[0--><div class="category-grid svelte-1pdq8kk"><!--[-->`);

			const each_array_4 = $.ensure_array_like(Array(6));

			for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
				let _ = each_array_4[$$index_4];

				Skeleton($$renderer, { class: 'aspect-square w-full' });
			}

			$$renderer.push(`<!--]--></div>`);
		} else if (featuredCategories.length > 0) {
			$$renderer.push(`<!--[1--><div class="category-grid svelte-1pdq8kk"><!--[-->`);

			const each_array_5 = $.ensure_array_like(featuredCategories.slice(0, 6));

			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let cat = each_array_5[$$index_5];

				$$renderer.push(`<a${$.attr('href', `/${$.stringify(cat.slug || cat._id)}`)} class="category-card svelte-1pdq8kk">`);

				if (cat.image || cat.img) {
					$$renderer.push(`<!--[0--><img${$.attr('src', themeImage(cat.image || cat.img, cat.name))}${$.attr('alt', cat.name)} class="svelte-1pdq8kk"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <strong class="svelte-1pdq8kk">${$.escape(cat.name)}</strong> <span class="svelte-1pdq8kk">${$.escape(themeContent.category.cardCta)}</span></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="theme-empty-state svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.category.emptyTitle)}</strong> <span class="svelte-1pdq8kk">${$.escape(themeContent.category.emptyText)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div></section> <section class="wine-section svelte-1pdq8kk" id="about"><div class="wine-container story-grid svelte-1pdq8kk"><div class="story-visual svelte-1pdq8kk"><div class="story-photo svelte-1pdq8kk"><img${$.attr('src', themeImage(themeContent.about.primaryImage, 'wine-about-1'))}${$.attr('alt', themeContent.about.primaryImageAlt)} class="svelte-1pdq8kk"/></div> <img class="story-photo-small svelte-1pdq8kk"${$.attr('src', themeImage(themeContent.about.secondaryImage, 'wine-about-2'))}${$.attr('alt', themeContent.about.secondaryImageAlt)}/> <div class="experience-badge svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.about.experienceValue)}</strong><span class="svelte-1pdq8kk">${$.escape(themeContent.about.experienceText)}</span></div></div> <div class="svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.about.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.about.titleLead)}<br class="svelte-1pdq8kk"/><span class="svelte-1pdq8kk">${$.escape(themeContent.about.titleAccent)}</span></h2> <div class="section-line left svelte-1pdq8kk"></div> <p class="body-copy svelte-1pdq8kk">${$.escape(themeContent.about.text)}</p> <div class="feature-list svelte-1pdq8kk"><!--[-->`);

		const each_array_6 = $.ensure_array_like(themeContent.about.features);

		for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
			let feature = each_array_6[$$index_6];

			$$renderer.push(`<div class="svelte-1pdq8kk"><span${$.attr_class(`feature-icon ${$.stringify(feature.tone)}`, 'svelte-1pdq8kk')}>`);

			if (feature.icon === 'leaf') {
				$$renderer.push('<!--[0-->');
				Leaf($$renderer, { class: 'h-5 w-5' });
			} else if (feature.icon === 'award') {
				$$renderer.push('<!--[1-->');
				Award($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				Zap($$renderer, { class: 'h-5 w-5' });
			}

			$$renderer.push(`<!--]--></span> <p class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(feature.title)}</strong><span class="svelte-1pdq8kk">${$.escape(feature.text)}</span></p></div>`);
		}

		$$renderer.push(`<!--]--></div> <a href="/products" class="wine-button primary svelte-1pdq8kk">`);
		BookOpen($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> ${$.escape(themeContent.about.cta)}</a></div></div></section> <section class="wine-section menu-section svelte-1pdq8kk" id="menu"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.menu.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.menu.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.menu.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="filter-row svelte-1pdq8kk" aria-label="Menu filters"><!--[-->`);

		const each_array_7 = $.ensure_array_like(filterButtons);

		for (let i = 0, $$length = each_array_7.length; i < $$length; i++) {
			let filter = each_array_7[i];

			$$renderer.push(`<button type="button"${$.attr_class('svelte-1pdq8kk', void 0, { 'active': i === 0 })}>${$.escape(filter)}</button>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (homepageModule.loadingFeaturedProducts) {
			$$renderer.push(`<!--[0--><div class="menu-grid svelte-1pdq8kk"><!--[-->`);

			const each_array_8 = $.ensure_array_like(Array(8));

			for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
				let _ = each_array_8[$$index_8];

				$$renderer.push(`<div class="menu-card svelte-1pdq8kk">`);
				Skeleton($$renderer, { class: 'aspect-square w-full' });
				$$renderer.push(`<!----> <div class="menu-content svelte-1pdq8kk">`);
				Skeleton($$renderer, { class: 'h-4 w-3/4' });
				$$renderer.push(`<!---->`);
				Skeleton($$renderer, { class: 'h-4 w-1/2' });
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else if (featuredProducts.length > 0) {
			$$renderer.push(`<!--[1--><div class="menu-grid svelte-1pdq8kk"><!--[-->`);

			const each_array_9 = $.ensure_array_like(featuredProducts.slice(0, 6));

			for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
				let product = each_array_9[$$index_9];

				$$renderer.push(`<a${$.attr('href', `/products/${$.stringify(product.slug)}`)} class="menu-card svelte-1pdq8kk"><div class="menu-image svelte-1pdq8kk"${$.attr_style(`aspect-ratio:${$.stringify(aspectWidth)}/${$.stringify(aspectHeight)};`)}><img${$.attr('src', product.image || product.img || product.thumbnail)}${$.attr('alt', product.name || product.title)} class="svelte-1pdq8kk"/> `);

				if (product.mrp && product.price && product.mrp > product.price) {
					$$renderer.push(`<!--[0--><em class="svelte-1pdq8kk">${$.escape(Math.round((product.mrp - product.price) / product.mrp * 100))}${$.escape(themeContent.menu.discountSuffix)}</em>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="menu-heart svelte-1pdq8kk">`);
				Heart($$renderer, { class: 'h-4 w-4' });
				$$renderer.push(`<!----></span></div> <div class="menu-content svelte-1pdq8kk"><p class="svelte-1pdq8kk">${$.escape(product.category?.name || themeContent.menu.categoryFallback)}</p> <h3 class="svelte-1pdq8kk">${$.escape(product.name || product.title)}</h3> <span class="menu-desc svelte-1pdq8kk">${$.escape(themeContent.menu.cardDescription)}</span> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(formatPrice(product.price, currencyCode || ''))}</strong> `);

				if (product.rating) {
					$$renderer.push(`<!--[0--><small class="svelte-1pdq8kk">`);
					Star($$renderer, { class: 'h-3 w-3 fill-current' });
					$$renderer.push(`<!----> (${$.escape(product.rating)})</small>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <b class="svelte-1pdq8kk">`);
				Plus($$renderer, { class: 'h-4 w-4' });
				$$renderer.push(`<!----></b></div></div></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="theme-empty-state svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.menu.emptyTitle)}</strong> <span class="svelte-1pdq8kk">${$.escape(themeContent.menu.emptyText)}</span></div>`);
		}

		$$renderer.push(`<!--]--> <div class="center-action svelte-1pdq8kk"><a href="/products" class="wine-button primary svelte-1pdq8kk">`);
		Utensils($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> ${$.escape(themeContent.menu.cta)}</a></div></div></section> <section class="special-section svelte-1pdq8kk" id="special"><div class="special-bg svelte-1pdq8kk"></div> <div class="wine-container offer-grid svelte-1pdq8kk"><div class="svelte-1pdq8kk"><span class="special-tag svelte-1pdq8kk">${$.escape(themeContent.special.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.special.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.special.titleAccent)}</span></h2> <p class="svelte-1pdq8kk">${$.escape(themeContent.special.text)}</p> <div class="countdown svelte-1pdq8kk" aria-label="Offer countdown"><div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(cdH)}</strong><span class="svelte-1pdq8kk">${$.escape(countdown()?.hoursLabel)}</span></div> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(cdM)}</strong><span class="svelte-1pdq8kk">${$.escape(countdown()?.minutesLabel)}</span></div> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(cdS)}</strong><span class="svelte-1pdq8kk">${$.escape(countdown()?.secondsLabel)}</span></div></div> <a href="/products" class="wine-button primary svelte-1pdq8kk">`);
		ShoppingCart($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> ${$.escape(themeContent.special.cta)}</a></div> <div class="special-image svelte-1pdq8kk"><div class="special-glow svelte-1pdq8kk"></div> <img${$.attr('src', themeImage(themeContent.special.image, 'wine-offer'))}${$.attr('alt', themeContent.special.imageAlt)} class="svelte-1pdq8kk"/> <div class="price-badge svelte-1pdq8kk"><span class="svelte-1pdq8kk">${$.escape(themeContent.special.oldPrice)}</span><strong class="svelte-1pdq8kk">${$.escape(themeContent.special.price)}</strong></div></div></div></section> <section class="wine-section gallery-section svelte-1pdq8kk" id="gallery"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.gallery.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.gallery.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.gallery.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="gallery-grid svelte-1pdq8kk"><!--[-->`);

		const each_array_10 = $.ensure_array_like(themeContent.gallery.items);

		for (let $$index_10 = 0,
			$$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
			let item = each_array_10[$$index_10];

			$$renderer.push(`<a href="/products" class="gallery-item svelte-1pdq8kk"><img${$.attr('src', themeImage(item.image, item.title))}${$.attr('alt', item.title)} class="svelte-1pdq8kk"/> <span class="svelte-1pdq8kk">`);
			Search($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----> ${$.escape(item.title)}</span></a>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="wine-section history-section svelte-1pdq8kk" id="history"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.history.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.history.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.history.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="timeline svelte-1pdq8kk"><!--[-->`);

		const each_array_11 = $.ensure_array_like(themeContent.history.items);

		for (let $$index_11 = 0,
			$$length = each_array_11.length; $$index_11 < $$length; $$index_11++) {
			let item = each_array_11[$$index_11];

			$$renderer.push(`<div class="timeline-item svelte-1pdq8kk"><div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(item[0])}</strong></div> <span class="svelte-1pdq8kk"></span> <div class="svelte-1pdq8kk"><h3 class="svelte-1pdq8kk">${$.escape(item[1])}</h3><p class="svelte-1pdq8kk">${$.escape(item[2])}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="wine-section chefs-section svelte-1pdq8kk" id="chefs"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.chefs.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.chefs.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.chefs.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="chef-grid svelte-1pdq8kk"><!--[-->`);

		const each_array_12 = $.ensure_array_like(themeContent.chefs.items);

		for (let $$index_12 = 0,
			$$length = each_array_12.length; $$index_12 < $$length; $$index_12++) {
			let chef = each_array_12[$$index_12];

			$$renderer.push(`<div class="chef-card svelte-1pdq8kk"><img${$.attr('src', themeImage(chef.image, chef.name))}${$.attr('alt', chef.name)} class="svelte-1pdq8kk"/> <div class="svelte-1pdq8kk"><h3 class="svelte-1pdq8kk">${$.escape(chef.name)}</h3> <span class="svelte-1pdq8kk">${$.escape(chef.role)}</span></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="hours-section svelte-1pdq8kk" id="hours"><div class="hours-bg svelte-1pdq8kk"></div> <div class="wine-container svelte-1pdq8kk"><div class="section-heading hours-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.hours.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.hours.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.hours.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="hours-grid svelte-1pdq8kk"><div class="hours-card svelte-1pdq8kk"><!--[-->`);

		const each_array_13 = $.ensure_array_like(themeContent.hours.rows);

		for (let $$index_13 = 0,
			$$length = each_array_13.length; $$index_13 < $$length; $$index_13++) {
			let row = each_array_13[$$index_13];

			$$renderer.push(`<div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk">`);
			CalendarCheck($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!---->${$.escape(row[0])}</span> <strong${$.attr_class('svelte-1pdq8kk', void 0, { 'closed': !row[2] })}><i${$.attr_class('svelte-1pdq8kk', void 0, { 'open': row[2] })}></i>${$.escape(row[1])}</strong></div>`);
		}

		$$renderer.push(`<!--]--></div> <div class="hours-cta svelte-1pdq8kk">`);
		Truck($$renderer, { class: 'h-10 w-10' });
		$$renderer.push(`<!----> <h3 class="svelte-1pdq8kk">${$.escape(themeContent.hours.orderTitle)}</h3> <p class="svelte-1pdq8kk">${$.escape(themeContent.hours.orderText)}</p> <a href="#menu" class="svelte-1pdq8kk">${$.escape(themeContent.hours.orderCta)}</a></div> <div class="hours-card svelte-1pdq8kk"><h3 class="svelte-1pdq8kk">`);
		MapPin($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.hours.locationTitle)}</h3> <div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk">`);
		MapPin($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.hours.addressLabel)}</span><strong class="svelte-1pdq8kk">${$.escape(themeContent.hours.address)}</strong></div> <div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk">`);
		Phone($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.hours.phoneLabel)}</span><strong class="svelte-1pdq8kk">${$.escape(themeContent.hours.phone)}</strong></div> <div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk">`);
		Mail($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.hours.emailLabel)}</span><strong class="svelte-1pdq8kk">${$.escape(themeContent.hours.email)}</strong></div></div></div></div></section> <section class="wine-section testimonials-section svelte-1pdq8kk" id="testimonials"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.testimonials.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.testimonials.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.testimonials.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="testimonial-grid svelte-1pdq8kk"><!--[-->`);

		const each_array_14 = $.ensure_array_like(themeContent.testimonials.items);

		for (let $$index_14 = 0,
			$$length = each_array_14.length; $$index_14 < $$length; $$index_14++) {
			let testimonial = each_array_14[$$index_14];

			$$renderer.push(`<div class="testimonial-card svelte-1pdq8kk">`);
			Quote($$renderer, { class: 'quote-icon' });
			$$renderer.push(`<!----> <div class="stars svelte-1pdq8kk">`);
			Star($$renderer, { class: 'h-4 w-4 fill-current' });
			$$renderer.push(`<!---->`);
			Star($$renderer, { class: 'h-4 w-4 fill-current' });
			$$renderer.push(`<!---->`);
			Star($$renderer, { class: 'h-4 w-4 fill-current' });
			$$renderer.push(`<!---->`);
			Star($$renderer, { class: 'h-4 w-4 fill-current' });
			$$renderer.push(`<!---->`);
			Star($$renderer, { class: 'h-4 w-4 fill-current' });
			$$renderer.push(`<!----></div> <p class="svelte-1pdq8kk">${$.escape(testimonial.text)}</p> <div class="testimonial-author svelte-1pdq8kk"><img${$.attr('src', themeImage(testimonial.image, testimonial.name))}${$.attr('alt', testimonial.name)} class="svelte-1pdq8kk"/> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(testimonial.name)}</strong><span class="svelte-1pdq8kk">${$.escape(testimonial.role)}</span></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="wine-section reservation-section svelte-1pdq8kk" id="reservation"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.reservation.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.reservation.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.reservation.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div> <p class="svelte-1pdq8kk">${$.escape(themeContent.reservation.text)}</p></div> <div class="reservation-grid svelte-1pdq8kk"><div class="contact-panel svelte-1pdq8kk"><h3 class="svelte-1pdq8kk">${$.escape(themeContent.reservation.panelTitle)}</h3> <p class="svelte-1pdq8kk">${$.escape(themeContent.reservation.panelText)}</p> <div class="svelte-1pdq8kk">`);
		Clock($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.reservation.hoursLabel)}</strong>${$.escape(themeContent.reservation.hours)}</span></div> <div class="svelte-1pdq8kk">`);
		Phone($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.reservation.phoneLabel)}</strong>${$.escape(themeContent.reservation.phone)}</span></div> <div class="svelte-1pdq8kk">`);
		Users($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.reservation.groupLabel)}</strong>${$.escape(themeContent.reservation.group)}</span></div> <div class="svelte-1pdq8kk">`);
		MapPin($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.reservation.locationLabel)}</strong>${$.escape(themeContent.reservation.location)}</span></div></div> <form class="source-form svelte-1pdq8kk"><label class="svelte-1pdq8kk">${$.escape(reservationForm()?.nameLabel)}<input type="text"${$.attr('placeholder', reservationForm()?.namePlaceholder)} class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(reservationForm()?.phoneLabel)}<input type="tel"${$.attr('placeholder', reservationForm()?.phonePlaceholder)} class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(reservationForm()?.emailLabel)}<input type="email"${$.attr('placeholder', reservationForm()?.emailPlaceholder)} class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(reservationForm()?.guestsLabel)}<select class="svelte-1pdq8kk"><!--[-->`);

		const each_array_15 = $.ensure_array_like(reservationForm()?.guestsOptions ?? []);

		for (let $$index_15 = 0,
			$$length = each_array_15.length; $$index_15 < $$length; $$index_15++) {
			let guests = each_array_15[$$index_15];

			$$renderer.option({ class: '' }, guests, 'svelte-1pdq8kk');
		}

		$$renderer.push(`<!--]--></select></label> <label class="svelte-1pdq8kk">${$.escape(reservationForm()?.dateLabel)}<input type="date" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(reservationForm()?.timeLabel)}<select class="svelte-1pdq8kk"><!--[-->`);

		const each_array_16 = $.ensure_array_like(reservationForm()?.timeOptions ?? []);

		for (let $$index_16 = 0,
			$$length = each_array_16.length; $$index_16 < $$length; $$index_16++) {
			let time = each_array_16[$$index_16];

			$$renderer.option({ class: '' }, time, 'svelte-1pdq8kk');
		}

		$$renderer.push(`<!--]--></select></label> <label class="full svelte-1pdq8kk">${$.escape(reservationForm()?.requestsLabel)}<textarea rows="3"${$.attr('placeholder', reservationForm()?.requestsPlaceholder)} class="svelte-1pdq8kk"></textarea></label> <button type="submit" class="wine-button primary full svelte-1pdq8kk">`);
		CalendarCheck($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.reservation.cta)}</button></form></div></div></section> <section class="wine-section blog-section svelte-1pdq8kk" id="blog"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.blog.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.blog.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.blog.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="blog-grid svelte-1pdq8kk"><!--[-->`);

		const each_array_17 = $.ensure_array_like(themeContent.blog.items);

		for (let $$index_17 = 0,
			$$length = each_array_17.length; $$index_17 < $$length; $$index_17++) {
			let blog = each_array_17[$$index_17];

			$$renderer.push(`<article class="blog-card svelte-1pdq8kk"><div class="blog-image svelte-1pdq8kk"><img${$.attr('src', themeImage(blog.image, blog.title))}${$.attr('alt', blog.title)} class="svelte-1pdq8kk"/> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(blog.date)}</strong><span class="svelte-1pdq8kk">${$.escape(blog.month)}</span></div></div> <div class="blog-body svelte-1pdq8kk"><span class="svelte-1pdq8kk">${$.escape(blog.tag)}</span> <h3 class="svelte-1pdq8kk"><a href="/blog" class="svelte-1pdq8kk">${$.escape(blog.title)}</a></h3> `);

			if (blog.author || blog.comments) {
				$$renderer.push(`<!--[0--><p class="svelte-1pdq8kk">`);

				if (blog.author) {
					$$renderer.push(`<!--[0--><span class="svelte-1pdq8kk">`);
					ChefHat($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!---->${$.escape(blog.author)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (blog.comments) {
					$$renderer.push(`<!--[0--><span class="svelte-1pdq8kk">`);
					Mail($$renderer, { class: 'h-3 w-3' });
					$$renderer.push(`<!---->${$.escape(blog.comments)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <a href="/blog" class="svelte-1pdq8kk">${$.escape(themeContent.blog.readMore)} `);
			ArrowRight($$renderer, { class: 'h-4 w-4' });
			$$renderer.push(`<!----></a></div></article>`);
		}

		$$renderer.push(`<!--]--></div></div></section> <section class="newsletter svelte-1pdq8kk" id="newsletter"><div class="newsletter-bg svelte-1pdq8kk"></div> <div class="wine-container newsletter-inner svelte-1pdq8kk"><span class="script-label light svelte-1pdq8kk">${$.escape(themeContent.newsletter.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.newsletter.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.newsletter.titleAccent)}</span></h2> <p class="svelte-1pdq8kk">${$.escape(themeContent.newsletter.text)}</p> <form class="svelte-1pdq8kk"><input type="email"${$.attr('placeholder', themeContent.newsletter.placeholder)} aria-label="Email address" class="svelte-1pdq8kk"/> <button type="submit" class="svelte-1pdq8kk">`);
		Send($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!----> ${$.escape(themeContent.newsletter.cta)}</button></form> <small class="svelte-1pdq8kk">`);
		Lock($$renderer, { class: 'h-3 w-3' });
		$$renderer.push(`<!---->${$.escape(themeContent.newsletter.privacy)}</small></div></section> <section class="wine-section contact-section svelte-1pdq8kk" id="contact-section"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk">${$.escape(themeContent.contact.label)}</span> <h2 class="svelte-1pdq8kk">${$.escape(themeContent.contact.titleLead)} <span class="svelte-1pdq8kk">${$.escape(themeContent.contact.titleAccent)}</span></h2> <div class="section-line svelte-1pdq8kk"></div> <p class="svelte-1pdq8kk">${$.escape(themeContent.contact.text)}</p></div> <div class="reservation-grid svelte-1pdq8kk"><div class="contact-panel svelte-1pdq8kk"><h3 class="svelte-1pdq8kk">${$.escape(themeContent.contact.panelTitle)}</h3> <p class="svelte-1pdq8kk">${$.escape(themeContent.contact.panelText)}</p> <div class="svelte-1pdq8kk">`);
		MapPin($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.contact.addressLabel)}</strong>${$.escape(themeContent.contact.address)}</span></div> <div class="svelte-1pdq8kk">`);
		Phone($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.contact.phoneLabel)}</strong>${$.escape(themeContent.contact.phone)}</span></div> <div class="svelte-1pdq8kk">`);
		Mail($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.contact.emailLabel)}</strong>${$.escape(themeContent.contact.email)}</span></div> <div class="svelte-1pdq8kk">`);
		Clock($$renderer, { class: 'h-5 w-5' });
		$$renderer.push(`<!----><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk">${$.escape(themeContent.contact.hoursLabel)}</strong>${$.escape(themeContent.contact.hours)}</span></div></div> <form class="source-form svelte-1pdq8kk"><label class="svelte-1pdq8kk">${$.escape(contactForm()?.nameLabel)}<input type="text"${$.attr('placeholder', contactForm()?.namePlaceholder)} class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(contactForm()?.emailLabel)}<input type="email"${$.attr('placeholder', contactForm()?.emailPlaceholder)} class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(contactForm()?.phoneLabel)}<input type="tel"${$.attr('placeholder', contactForm()?.phonePlaceholder)} class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk">${$.escape(contactForm()?.subjectLabel)}<select class="svelte-1pdq8kk"><!--[-->`);

		const each_array_18 = $.ensure_array_like(contactForm()?.subjectOptions ?? []);

		for (let $$index_18 = 0,
			$$length = each_array_18.length; $$index_18 < $$length; $$index_18++) {
			let subject = each_array_18[$$index_18];

			$$renderer.option({ class: '' }, subject, 'svelte-1pdq8kk');
		}

		$$renderer.push(`<!--]--></select></label> <label class="full svelte-1pdq8kk">${$.escape(contactForm()?.messageLabel)}<textarea rows="5"${$.attr('placeholder', contactForm()?.messagePlaceholder)} class="svelte-1pdq8kk"></textarea></label> <button type="submit" class="wine-button primary svelte-1pdq8kk">`);
		Send($$renderer, { class: 'h-4 w-4' });
		$$renderer.push(`<!---->${$.escape(themeContent.contact.cta)}</button></form></div></div></section>`);
	});
}