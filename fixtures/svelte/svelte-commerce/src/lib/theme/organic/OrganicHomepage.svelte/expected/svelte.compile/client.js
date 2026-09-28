import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<div class="organic-stat-item svelte-1nhk12g"><strong class="svelte-1nhk12g"> </strong> <span class="svelte-1nhk12g"> </span></div>`);
var root_1 = $.from_html(`<div class="organic-feature-card svelte-1nhk12g"><div class="organic-feature-icon svelte-1nhk12g"><!></div> <h3 class="svelte-1nhk12g"> </h3> <p class="svelte-1nhk12g"> </p></div>`);
var root_2 = $.from_html(`<img class="svelte-1nhk12g"/>`);
var root_3 = $.from_html(`<div class="organic-category-placeholder svelte-1nhk12g"><!></div>`);
var root_4 = $.from_html(`<a class="organic-category-card svelte-1nhk12g"><!> <span class="svelte-1nhk12g"> </span></a>`);
var root_5 = $.from_html(`<section class="organic-section svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-section-header svelte-1nhk12g"><div><h2 class="svelte-1nhk12g"> </h2></div> <a href="/products" class="organic-view-all svelte-1nhk12g"> <!></a></div> <div class="organic-category-grid svelte-1nhk12g"></div></div></section>`);
var root_6 = $.from_html(`<span class="organic-discount-badge svelte-1nhk12g"><!> </span>`);
var root_7 = $.from_html(`<small class="svelte-1nhk12g"> </small>`);
var root_8 = $.from_html(`<div class="organic-product-rating svelte-1nhk12g"><span> </span> <!></div>`);
var root_9 = $.from_html(`<span class="organic-price-old svelte-1nhk12g"> </span>`);
var root_10 = $.from_html(`<a class="organic-product-card svelte-1nhk12g"><div class="organic-product-img svelte-1nhk12g"><!> <!></div> <div class="organic-product-info svelte-1nhk12g"><!> <h3 class="svelte-1nhk12g"> </h3> <span class="organic-product-meta svelte-1nhk12g"> </span> <div class="organic-product-price svelte-1nhk12g"><!> <strong class="svelte-1nhk12g"> </strong></div></div> <div class="organic-card-actions svelte-1nhk12g"><div class="organic-qty svelte-1nhk12g"><!> <span>1</span> <!></div> <button class="organic-add-to-cart svelte-1nhk12g"><!> </button> <!></div></a>`);
var root_11 = $.from_html(`<div class="organic-product-grid svelte-1nhk12g"></div>`);
var root_12 = $.from_html(`<div class="organic-empty-state svelte-1nhk12g"><!> <strong class="svelte-1nhk12g"> </strong> <span class="svelte-1nhk12g"> </span></div>`);
var root_13 = $.from_html(`<div><div class="svelte-1nhk12g"><span class="svelte-1nhk12g"> </span> <h3 class="svelte-1nhk12g"> </h3> <a class="svelte-1nhk12g"> <!></a></div></div>`);
var root_14 = $.from_html(`<a class="organic-app-link svelte-1nhk12g"> </a>`);
var root_15 = $.from_html(`<div class="organic-trust-item svelte-1nhk12g"><div class="organic-trust-icon svelte-1nhk12g"><!></div> <div><strong class="svelte-1nhk12g"> </strong> <span class="svelte-1nhk12g"> </span></div></div>`);
var root_16 = $.from_html(`<section class="organic-hero svelte-1nhk12g"><div class="organic-container organic-hero-shell svelte-1nhk12g"><div class="organic-hero-inner svelte-1nhk12g"><div class="organic-hero-content svelte-1nhk12g"><h1 class="svelte-1nhk12g"><span class="organic-text-primary svelte-1nhk12g"> </span> <span class="svelte-1nhk12g"> </span></h1> <p class="svelte-1nhk12g"> </p> <div class="organic-hero-actions svelte-1nhk12g"><a href="/products" class="organic-btn-primary svelte-1nhk12g"> <!></a> <a href="/categories" class="organic-btn-secondary svelte-1nhk12g"> </a></div></div></div></div></section> <section class="organic-stats svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-stats-grid svelte-1nhk12g"></div></div></section> <section class="organic-features svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-features-grid svelte-1nhk12g"></div></div></section> <!> <section class="organic-section organic-section-alt svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-section-header svelte-1nhk12g"><div><h2 class="svelte-1nhk12g"> </h2></div> <a href="/products" class="organic-view-all svelte-1nhk12g"> <!></a></div> <!></div></section> <section class="organic-section svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-promo-grid svelte-1nhk12g"></div></div></section> <section class="organic-newsletter svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-newsletter-inner svelte-1nhk12g"><div class="organic-newsletter-content svelte-1nhk12g"><span class="organic-section-label svelte-1nhk12g"> </span> <h2 class="svelte-1nhk12g"> <span class="organic-text-secondary svelte-1nhk12g"> </span> </h2> <p class="svelte-1nhk12g"> </p></div> <form class="organic-newsletter-form svelte-1nhk12g"><input type="email" class="svelte-1nhk12g"/> <button type="submit" class="svelte-1nhk12g"> </button></form></div></div></section> <section class="organic-app svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-app-inner svelte-1nhk12g"><div class="organic-app-content svelte-1nhk12g"><h2 class="svelte-1nhk12g"> </h2> <p class="svelte-1nhk12g"> </p> <div class="organic-app-buttons svelte-1nhk12g"></div></div> <img class="organic-app-phone svelte-1nhk12g"/></div></div></section> <section class="organic-trust svelte-1nhk12g"><div class="organic-container svelte-1nhk12g"><div class="organic-trust-grid svelte-1nhk12g"></div></div></section>`, 1);

export default function OrganicHomepage($$anchor, $$props) {
	$.push($$props, true);

	let featuredCategories = $.prop($$props, 'featuredCategories', 19, () => []),
		featuredProducts = $.prop($$props, 'featuredProducts', 19, () => []),
		filterButtons = $.prop($$props, 'filterButtons', 19, () => []);

	// Content-declared icons, resolved to components here so the copy stays editable.
	const ICONS = {
		leaf: Leaf,
		shield: Shield,
		truck: Truck,
		star: Star,
		award: Star,
		zap: Truck
	};

	const stats = $.derived(() => $$props.themeContent.hero.stats ?? []);
	const features = $.derived(() => $$props.themeContent.about.features ?? []);
	const trustBadges = $.derived(() => $$props.themeContent.trust?.items ?? []);
	const promoBanners = $.derived(() => $$props.themeContent.promoBanners ?? []);

	// The promo grid's asymmetric layout lives in these three classes (grid-area only).
	const PROMO_VARIANTS = [
		'organic-promo-sale',
		'organic-promo-combo',
		'organic-promo-coupon'
	];

	const appDownload = $.derived(() => $$props.themeContent.appDownload);
	const labels = $.derived(() => $$props.themeContent.labels ?? {});

	// The live catalogue wins; the theme's tiles only stand in for a store with no categories.
	const displayCategories = $.derived(() => featuredCategories()?.length
		? featuredCategories().map((category) => ({
			title: category?.name || category?.title || '',
			href: category?.slug ? '/' + category.slug : category?.link || '/products',
			image: category?.image || category?.thumbnail || category?.img || '',
			imageAlt: ''
		}))
		: $$props.themeContent.tiles?.categories ?? []);

	const displayProducts = $.derived(featuredProducts);

	/** Real rating out of 5, or 0 when the product carries none. */
	function ratingOf(product) {
		const value = Number(product?.rating ?? product?.ratings?.average ?? 0);

		return Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
	}

	function ratingCountOf(product) {
		return Number(product?.ratingCount ?? product?.ratings?.count ?? 0) || 0;
	}

	var fragment = root_16();
	var section = $.first_child(fragment);
	var div = $.child(section);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var h1 = $.child(div_2);
	var span = $.child(h1);
	var text = $.only_child(span, true);
	var text_1 = $.sibling(span);
	var span_1 = $.sibling(text_1);
	var text_2 = $.only_child(span_1, true);

	$.reset(h1);

	var p = $.sibling(h1, 2);
	var text_3 = $.only_child(p, true);
	var div_3 = $.sibling(p, 2);
	var a = $.child(div_3);
	var text_4 = $.child(a);
	var node = $.sibling(text_4);

	ArrowRight(node, { class: 'h-4 w-4' });
	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var text_5 = $.only_child(a_1, true);

	$.reset(div_3);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_4 = $.child(section_1);
	var div_5 = $.child(div_4);

	$.each(div_5, 21, () => $.get(stats), $.index, ($$anchor, stat) => {
		var div_6 = root();
		var strong = $.child(div_6);
		var text_6 = $.only_child(strong);
		var span_2 = $.sibling(strong, 2);
		var text_7 = $.only_child(span_2, true);

		$.reset(div_6);

		$.template_effect(() => {
			$.set_text(text_6, `${$.get(stat).value ?? ''}${$.get(stat).suffix ?? '' ?? ''}`);
			$.set_text(text_7, $.get(stat).label);
		});

		$.append($$anchor, div_6);
	});

	$.reset(div_5);
	$.reset(div_4);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_7 = $.child(section_2);
	var div_8 = $.child(div_7);

	$.each(div_8, 21, () => $.get(features), $.index, ($$anchor, feature) => {
		const FeatureIcon = $.derived(() => ICONS[$.get(feature).icon] ?? Leaf);
		var div_9 = root_1();
		var div_10 = $.child(div_9);
		var node_1 = $.child(div_10);

		$.component(node_1, () => $.get(FeatureIcon), ($$anchor, FeatureIcon_1) => {
			FeatureIcon_1($$anchor, { class: 'h-6 w-6' });
		});

		$.reset(div_10);

		var h3 = $.sibling(div_10, 2);
		var text_8 = $.only_child(h3, true);
		var p_1 = $.sibling(h3, 2);
		var text_9 = $.only_child(p_1, true);

		$.reset(div_9);

		$.template_effect(() => {
			$.set_text(text_8, $.get(feature).title);
			$.set_text(text_9, $.get(feature).text);
		});

		$.append($$anchor, div_9);
	});

	$.reset(div_8);
	$.reset(div_7);
	$.reset(section_2);

	var node_2 = $.sibling(section_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var section_3 = root_5();
			var div_11 = $.child(section_3);
			var div_12 = $.child(div_11);
			var div_13 = $.child(div_12);
			var h2 = $.child(div_13);
			var text_10 = $.only_child(h2);

			$.reset(div_13);

			var a_2 = $.sibling(div_13, 2);
			var text_11 = $.child(a_2);
			var node_3 = $.sibling(text_11);

			ArrowRight(node_3, { class: 'h-4 w-4' });
			$.reset(a_2);
			$.reset(div_12);

			var div_14 = $.sibling(div_12, 2);

			$.each(div_14, 21, () => $.get(displayCategories).slice(0, 8), $.index, ($$anchor, category) => {
				var a_3 = root_4();
				var node_4 = $.child(a_3);

				{
					var consequent = ($$anchor) => {
						var img = root_2();

						$.template_effect(
							($0) => {
								$.set_attribute(img, 'src', $0);
								$.set_attribute(img, 'alt', $.get(category).imageAlt || $.get(category).title);
							},
							[
								() => themeImage($.get(category).image, $.get(category).title)
							]
						);

						$.append($$anchor, img);
					};

					var alternate = ($$anchor) => {
						var div_15 = root_3();
						var node_5 = $.child(div_15);

						Leaf(node_5, { class: 'h-8 w-8' });
						$.reset(div_15);
						$.append($$anchor, div_15);
					};

					$.if(node_4, ($$render) => {
						if ($.get(category).image) $$render(consequent); else $$render(alternate, -1);
					});
				}

				var span_3 = $.sibling(node_4, 2);
				var text_12 = $.only_child(span_3, true);

				$.reset(a_3);

				$.template_effect(() => {
					$.set_attribute(a_3, 'href', $.get(category).href);
					$.set_text(text_12, $.get(category).title);
				});

				$.append($$anchor, a_3);
			});

			$.reset(div_14);
			$.reset(div_11);
			$.reset(section_3);

			$.template_effect(() => {
				$.set_text(text_10, `${$$props.themeContent.category.titleLead ?? ''} ${$$props.themeContent.category.titleAccent ?? ''}`);
				$.set_text(text_11, `${$.get(labels).viewAll ?? ''} `);
			});

			$.append($$anchor, section_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(displayCategories).length > 0) $$render(consequent_1);
		});
	}

	var section_4 = $.sibling(node_2, 2);
	var div_16 = $.child(section_4);
	var div_17 = $.child(div_16);
	var div_18 = $.child(div_17);
	var h2_1 = $.child(div_18);
	var text_13 = $.only_child(h2_1);

	$.reset(div_18);

	var a_4 = $.sibling(div_18, 2);
	var text_14 = $.child(a_4);
	var node_6 = $.sibling(text_14);

	ArrowRight(node_6, { class: 'h-4 w-4' });
	$.reset(a_4);
	$.reset(div_17);

	var node_7 = $.sibling(div_17, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_19 = root_11();

			$.each(div_19, 21, () => $.get(displayProducts).slice(0, 10), $.index, ($$anchor, product) => {
				const rating = $.derived(() => ratingOf($.get(product)));
				var a_5 = root_10();
				var div_20 = $.child(a_5);
				var node_8 = $.child(div_20);

				{
					var consequent_2 = ($$anchor) => {
						var img_1 = root_2();

						$.template_effect(() => {
							$.set_attribute(img_1, 'src', $.get(product).image || $.get(product).img || $.get(product).thumbnail);
							$.set_attribute(img_1, 'alt', $.get(product).name || $.get(product).title);
						});

						$.append($$anchor, img_1);
					};

					$.if(node_8, ($$render) => {
						if ($.get(product).image || $.get(product).img || $.get(product).thumbnail) $$render(consequent_2);
					});
				}

				var node_9 = $.sibling(node_8, 2);

				{
					var consequent_3 = ($$anchor) => {
						var span_4 = root_6();
						var node_10 = $.child(span_4);

						Tag(node_10, { class: 'h-3 w-3' });

						var text_15 = $.sibling(node_10);

						$.reset(span_4);
						$.template_effect(() => $.set_text(text_15, ` ${$.get(product).discount ?? ''}${$$props.themeContent.menu.discountSuffix ?? ''}`));
						$.append($$anchor, span_4);
					};

					$.if(node_9, ($$render) => {
						if ($.get(product).discount) $$render(consequent_3);
					});
				}

				$.reset(div_20);

				var div_21 = $.sibling(div_20, 2);
				var node_11 = $.child(div_21);

				{
					var consequent_5 = ($$anchor) => {
						var div_22 = root_8();
						var span_5 = $.child(div_22);
						var text_16 = $.only_child(span_5);
						var node_12 = $.sibling(span_5, 2);

						{
							var consequent_4 = ($$anchor) => {
								var small = root_7();
								var text_17 = $.only_child(small);

								$.template_effect(($0) => $.set_text(text_17, `(${$0 ?? ''})`), [() => ratingCountOf($.get(product))]);
								$.append($$anchor, small);
							};

							var d = $.derived(() => ratingCountOf($.get(product)));

							$.if(node_12, ($$render) => {
								if ($.get(d)) $$render(consequent_4);
							});
						}

						$.reset(div_22);

						$.template_effect(($0, $1) => $.set_text(text_16, `${$0 ?? ''}${$1 ?? ''}`), [
							() => ("★").repeat(Math.round($.get(rating))),
							() => ("☆").repeat(5 - Math.round($.get(rating)))
						]);

						$.append($$anchor, div_22);
					};

					$.if(node_11, ($$render) => {
						if ($.get(rating) > 0) $$render(consequent_5);
					});
				}

				var h3_1 = $.sibling(node_11, 2);
				var text_18 = $.only_child(h3_1, true);
				var span_6 = $.sibling(h3_1, 2);
				var text_19 = $.only_child(span_6, true);
				var div_23 = $.sibling(span_6, 2);
				var node_13 = $.child(div_23);

				{
					var consequent_6 = ($$anchor) => {
						var span_7 = root_9();
						var text_20 = $.only_child(span_7, true);

						$.template_effect(($0) => $.set_text(text_20, $0), [
							() => formatPrice($.get(product).mrp, $$props.currencyCode || '')
						]);

						$.append($$anchor, span_7);
					};

					$.if(node_13, ($$render) => {
						if ($.get(product).mrp && $.get(product).mrp > $.get(product).price) $$render(consequent_6);
					});
				}

				var strong_1 = $.sibling(node_13, 2);
				var text_21 = $.only_child(strong_1, true);

				$.reset(div_23);
				$.reset(div_21);

				var div_24 = $.sibling(div_21, 2);
				var div_25 = $.child(div_24);
				var node_14 = $.child(div_25);

				Minus(node_14, { class: 'h-3 w-3' });

				var node_15 = $.sibling(node_14, 4);

				Plus(node_15, { class: 'h-3 w-3' });
				$.reset(div_25);

				var button = $.sibling(div_25, 2);
				var node_16 = $.child(button);

				ShoppingCart(node_16, { class: 'h-4 w-4' });

				var text_22 = $.sibling(node_16);

				$.reset(button);

				var node_17 = $.sibling(button, 2);

				Heart(node_17, { class: 'h-5 w-5 organic-heart' });
				$.reset(div_24);
				$.reset(a_5);

				$.template_effect(
					($0) => {
						$.set_attribute(a_5, 'href', `/products/${$.get(product).slug ?? ''}`);
						$.set_style(div_20, `aspect-ratio:${$$props.aspectWidth ?? ''}/${$$props.aspectHeight ?? ''};`);
						$.set_text(text_18, $.get(product).name || $.get(product).title);
						$.set_text(text_19, $.get(labels).unit);
						$.set_text(text_21, $0);
						$.set_text(text_22, ` ${$.get(labels).addToCart ?? ''}`);
					},
					[
						() => formatPrice($.get(product).price, $$props.currencyCode || '')
					]
				);

				$.append($$anchor, a_5);
			});

			$.reset(div_19);
			$.append($$anchor, div_19);
		};

		var alternate_1 = ($$anchor) => {
			var div_26 = root_12();
			var node_18 = $.child(div_26);

			Leaf(node_18, { class: 'h-12 w-12 text-primary/30' });

			var strong_2 = $.sibling(node_18, 2);
			var text_23 = $.only_child(strong_2, true);
			var span_8 = $.sibling(strong_2, 2);
			var text_24 = $.only_child(span_8, true);

			$.reset(div_26);

			$.template_effect(() => {
				$.set_text(text_23, $$props.themeContent.menu.emptyTitle);
				$.set_text(text_24, $$props.themeContent.menu.emptyText);
			});

			$.append($$anchor, div_26);
		};

		$.if(node_7, ($$render) => {
			if ($.get(displayProducts).length > 0) $$render(consequent_7); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_16);
	$.reset(section_4);

	var section_5 = $.sibling(section_4, 2);
	var div_27 = $.child(section_5);
	var div_28 = $.child(div_27);

	$.each(div_28, 21, () => $.get(promoBanners), $.index, ($$anchor, banner, index) => {
		const variant = $.derived(() => PROMO_VARIANTS[index] ?? '');
		var div_29 = root_13();
		var div_30 = $.child(div_29);
		var span_9 = $.child(div_30);
		var text_25 = $.only_child(span_9, true);
		var h3_2 = $.sibling(span_9, 2);
		var text_26 = $.only_child(h3_2, true);
		var a_6 = $.sibling(h3_2, 2);
		var text_27 = $.child(a_6);
		var node_19 = $.sibling(text_27);

		ArrowRight(node_19, { class: 'h-4 w-4' });
		$.reset(a_6);
		$.reset(div_30);
		$.reset(div_29);

		$.template_effect(() => {
			$.set_class(div_29, 1, `organic-promo-card ${$.get(variant) ?? ''}`, 'svelte-1nhk12g');

			$.set_style(div_29, $.get(banner).image
				? `background-image: url('${$.get(banner).image}')`
				: undefined);

			$.set_text(text_25, $.get(banner).eyebrow);
			$.set_text(text_26, $.get(banner).title);
			$.set_attribute(a_6, 'href', $.get(banner).href);
			$.set_text(text_27, `${$.get(banner).cta ?? ''} `);
		});

		$.append($$anchor, div_29);
	});

	$.reset(div_28);
	$.reset(div_27);
	$.reset(section_5);

	var section_6 = $.sibling(section_5, 2);
	var div_31 = $.child(section_6);
	var div_32 = $.child(div_31);
	var div_33 = $.child(div_32);
	var span_10 = $.child(div_33);
	var text_28 = $.only_child(span_10, true);
	var h2_2 = $.sibling(span_10, 2);
	var text_29 = $.child(h2_2);
	var span_11 = $.sibling(text_29);
	var text_30 = $.only_child(span_11, true);
	var text_31 = $.sibling(span_11);

	$.reset(h2_2);

	var p_2 = $.sibling(h2_2, 2);
	var text_32 = $.only_child(p_2, true);

	$.reset(div_33);

	var form = $.sibling(div_33, 2);
	var input = $.child(form);
	var button_1 = $.sibling(input, 2);
	var text_33 = $.only_child(button_1, true);

	$.reset(form);
	$.reset(div_32);
	$.reset(div_31);
	$.reset(section_6);

	var section_7 = $.sibling(section_6, 2);
	var div_34 = $.child(section_7);
	var div_35 = $.child(div_34);
	var div_36 = $.child(div_35);
	var h2_3 = $.child(div_36);
	var text_34 = $.only_child(h2_3, true);
	var p_3 = $.sibling(h2_3, 2);
	var text_35 = $.only_child(p_3, true);
	var div_37 = $.sibling(p_3, 2);

	$.each(div_37, 21, () => $.get(appDownload)?.links ?? [], $.index, ($$anchor, link) => {
		var a_7 = root_14();
		var text_36 = $.only_child(a_7, true);

		$.template_effect(() => {
			$.set_attribute(a_7, 'href', $.get(link).href);
			$.set_text(text_36, $.get(link).label);
		});

		$.append($$anchor, a_7);
	});

	$.reset(div_37);
	$.reset(div_36);

	var img_2 = $.sibling(div_36, 2);

	$.reset(div_35);
	$.reset(div_34);
	$.reset(section_7);

	var section_8 = $.sibling(section_7, 2);
	var div_38 = $.child(section_8);
	var div_39 = $.child(div_38);

	$.each(div_39, 21, () => $.get(trustBadges), $.index, ($$anchor, badge) => {
		const BadgeIcon = $.derived(() => ICONS[$.get(badge).icon ?? "leaf"] ?? Leaf);
		var div_40 = root_15();
		var div_41 = $.child(div_40);
		var node_20 = $.child(div_41);

		$.component(node_20, () => $.get(BadgeIcon), ($$anchor, BadgeIcon_1) => {
			BadgeIcon_1($$anchor, { class: 'h-6 w-6' });
		});

		$.reset(div_41);

		var div_42 = $.sibling(div_41, 2);
		var strong_3 = $.child(div_42);
		var text_37 = $.only_child(strong_3, true);
		var span_12 = $.sibling(strong_3, 2);
		var text_38 = $.only_child(span_12, true);

		$.reset(div_42);
		$.reset(div_40);

		$.template_effect(() => {
			$.set_text(text_37, $.get(badge).title);
			$.set_text(text_38, $.get(badge).text);
		});

		$.append($$anchor, div_40);
	});

	$.reset(div_39);
	$.reset(div_38);
	$.reset(section_8);

	$.template_effect(
		($0) => {
			$.set_style(section, $$props.themeContent.hero.backgroundImage
				? `background-image: url('${$$props.themeContent.hero.backgroundImage}')`
				: undefined);

			$.set_text(text, $$props.themeContent.hero.titleLead);
			$.set_text(text_1, ` ${$$props.themeContent.hero.titleAccent ?? ''} `);
			$.set_text(text_2, $$props.themeContent.hero.titleRest);
			$.set_text(text_3, $$props.themeContent.hero.text);
			$.set_text(text_4, `${$$props.themeContent.hero.primaryCta ?? ''} `);
			$.set_text(text_5, $$props.themeContent.hero.secondaryCta);
			$.set_text(text_13, `${$$props.themeContent.menu.titleLead ?? ''} ${$$props.themeContent.menu.titleAccent ?? ''}`);
			$.set_text(text_14, `${$.get(labels).viewAll ?? ''} `);

			$.set_style(section_6, $$props.themeContent.newsletter.backgroundImage
				? `background-image: url('${$$props.themeContent.newsletter.backgroundImage}')`
				: undefined);

			$.set_text(text_28, $$props.themeContent.newsletter.label);
			$.set_text(text_29, `${$$props.themeContent.newsletter.titleLead ?? ''} `);
			$.set_text(text_30, $$props.themeContent.newsletter.titleAccent);
			$.set_text(text_31, ` ${$$props.themeContent.newsletter.titleRest ?? ''}`);
			$.set_text(text_32, $$props.themeContent.newsletter.text);
			$.set_attribute(input, 'placeholder', $$props.themeContent.newsletter.placeholder);
			$.set_text(text_33, $$props.themeContent.newsletter.cta);
			$.set_text(text_34, $.get(appDownload)?.title);
			$.set_text(text_35, $.get(appDownload)?.text);
			$.set_attribute(img_2, 'src', $0);
			$.set_attribute(img_2, 'alt', $.get(appDownload)?.imageAlt);
		},
		[() => themeImage($.get(appDownload)?.image, 'organic-app')]
	);

	$.event('submit', form, (e) => e.preventDefault());
	$.append($$anchor, fragment);
	$.pop();
}